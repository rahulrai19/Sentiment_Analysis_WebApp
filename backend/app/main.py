from fastapi import FastAPI, HTTPException, Request, Depends
from .routes.api import router
from .middleware.logging import LoggingMiddleware
from .middleware.performance import PerformanceMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from fastapi.middleware.gzip import GZipMiddleware
import os
from dotenv import load_dotenv
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import functools
from pydantic import BaseModel
import datetime
from typing import List, Optional
import motor.motor_asyncio
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import time
import logging
import asyncio
from starlette.responses import JSONResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables with fallbacks
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    logger.warning("MONGO_URI environment variable is not set, using fallback")
    # Fallback to a local MongoDB or create a simple in-memory storage
    MONGO_URI = "mongodb://localhost:27017/feedbackDB"

# Validate MongoDB URI format
if not MONGO_URI.startswith(("mongodb://", "mongodb+srv://")):
    logger.error(f"Invalid MongoDB URI format: {MONGO_URI}")
    raise ValueError("MONGO_URI must start with mongodb:// or mongodb+srv://")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://verbose-feedbacker.netlify.app").split(",")
API_KEY = os.getenv("API_KEY")

app = FastAPI(
    title="FastAPI Sentiment Backend",
    version="v1"
)

# Add compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security
api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if not API_KEY or api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

# CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(PerformanceMiddleware)

# Database connection with retry mechanism and connection pooling
async def get_database():
    global use_fallback
    max_retries = 3  # Reduced retries for faster fallback
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            # Configure connection with pooling
            client = AsyncIOMotorClient(
                MONGO_URI,
                maxPoolSize=50,
                minPoolSize=10,
                maxIdleTimeMS=30000,
                serverSelectionTimeoutMS=3000,  # Reduced timeout
                connectTimeoutMS=5000,  # Reduced timeout
                socketTimeoutMS=10000,  # Reduced timeout
            )
            # Verify connection
            await client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            use_fallback = False
            return client["feedbackDB"]
        except Exception as e:
            logger.error(f"Attempt {attempt + 1}/{max_retries} failed to connect to MongoDB: {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.warning("Failed to connect to MongoDB, switching to fallback storage")
                use_fallback = True
                return None  # Return None to indicate fallback mode

# Initialize database connection
db = None
collection = None

@app.on_event("startup")
async def startup_db_client():
    global db, collection, vader_analyzer, use_fallback
    try:
        db = await get_database()
        
        if db is not None:
            collection = db["feedback"]
            logger.info("Successfully connected to MongoDB and initialized collection")
        else:
            logger.warning("Using fallback in-memory storage")
            use_fallback = True
        
        # Initialize sentiment analyzer once
        vader_analyzer = SentimentIntensityAnalyzer()
        
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        logger.warning("Continuing with fallback storage mode")
        use_fallback = True
        vader_analyzer = SentimentIntensityAnalyzer()

# Initialize sentiment analyzers once at startup
vader_analyzer = None
textblob_cache = {}

# Simple in-memory cache for API responses
response_cache = {}
CACHE_TTL = 300  # 5 minutes

# Fallback in-memory storage when MongoDB is not available
fallback_storage = []
use_fallback = False

@functools.lru_cache(maxsize=1000)
def analyze_sentiment(text: str) -> str:
    """Optimized sentiment analysis with caching"""
    # Use VaderSentiment for better performance
    vader_scores = vader_analyzer.polarity_scores(text)
    compound_score = vader_scores['compound']
    
    if compound_score >= 0.05:
        return "Positive"
    elif compound_score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

class FeedbackIn(BaseModel):
    name: str
    event: str
    eventType: str
    comment: str
    rating: int

class Event(BaseModel):
    name: str

# Rate limiting middleware
class RateLimitMiddleware:
    def __init__(self, app, requests_per_minute: int = 60):
        self.app = app
        self.requests_per_minute = requests_per_minute
        self.requests = {}

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        client = scope.get("client")
        client_ip = client[0] if client else "unknown"
        current_time = time.time()

        # Clean up old requests
        self.requests[client_ip] = [
            t for t in self.requests.get(client_ip, []) if current_time - t < 60
        ]

        # Check rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            response = JSONResponse(
                {"detail": "Too many requests"}, status_code=429
            )
            await response(scope, receive, send)
            return

        # Add current request
        self.requests[client_ip].append(current_time)
        await self.app(scope, receive, send)

app.add_middleware(RateLimitMiddleware)

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        if use_fallback:
            return {"status": "healthy", "database": "fallback_mode", "storage": "in_memory"}
        elif db:
            await db.command("ping")
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "healthy", "database": "fallback_mode", "storage": "in_memory"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "healthy", "database": "fallback_mode", "storage": "in_memory"}

# Get all feedbacks endpoint (using database or fallback)
@app.get("/feedbacks")
async def get_all_feedbacks(limit: int = 100, skip: int = 0):
    try:
        if use_fallback:
            # Use in-memory storage
            feedbacks = fallback_storage[skip:skip + limit]
            total = len(fallback_storage)
            return {
                "data": feedbacks,
                "total": total,
                "limit": limit,
                "skip": skip,
                "storage": "fallback"
            }
        else:
            # Use MongoDB
            feedbacks = await collection.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(length=None)
            total = await collection.count_documents({})
            return {
                "data": feedbacks,
                "total": total,
                "limit": limit,
                "skip": skip,
                "storage": "mongodb"
            }
    except Exception as e:
        logger.error(f"Error fetching feedbacks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedbacks")

# API endpoint to fetch feedback summary with optional event type filter (using database)
@app.get("/api/feedback-summary")
async def feedback_summary(event_name: str | None = None, event_type: str | None = None):
    """
    Get feedback sentiment summary and recent feedbacks, optionally filtered by event name and event type.
    """
    try:
        # Build the query filter
        filter_query = {}
        if event_name:
            filter_query["event"] = event_name
            print(f"Filtering feedback summary by event: {event_name}")
        if event_type:
            filter_query["eventType"] = event_type
            print(f"Filtering feedback summary by event type: {event_type}")

        # Use await with the async find method and to_list
        feedbacks = await collection.find(filter_query, {"_id": 0}).to_list(length=None)

        print(f"Fetched {len(feedbacks)} feedbacks after filtering")

        sentiments = {"positive": 0, "neutral": 0, "negative": 0}
        for feedback in feedbacks:
            if "sentiment" in feedback and feedback["sentiment"].lower() in sentiments:
                sentiments[feedback["sentiment"].lower()] += 1

        return {"sentiments": sentiments, "recent_feedback": feedbacks}

    except Exception as e:
        print(f"Error in feedback_summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Submit feedback to database endpoint
@app.post("/api/submit-feedback")
async def submit_feedback_to_db(feedback: FeedbackIn): # Renamed function to avoid confusion
    if not isinstance(feedback.comment, str):
        raise HTTPException(status_code=400, detail="Comment must be a string")
    if len(feedback.comment.strip()) < 3:
        raise HTTPException(status_code=400, detail="Comment is too short")
    sentiment = analyze_sentiment(feedback.comment)
    feedback_dict = feedback.model_dump()  # For Pydantic v2+
    feedback_dict["sentiment"] = sentiment
    feedback_dict["submissionDate"] = datetime.datetime.utcnow().isoformat()  # Add submission date
    
    try:
        if use_fallback:
            # Use in-memory storage
            fallback_storage.append(feedback_dict)
            logger.info(f"Feedback saved to fallback storage: {sentiment}")
        else:
            # Use MongoDB
            await collection.insert_one(feedback_dict)
            logger.info(f"Feedback saved to MongoDB: {sentiment}")
        
        return {"status": "Feedback saved!", "sentiment": sentiment, "storage": "fallback" if use_fallback else "mongodb"}
    except Exception as e:
        logger.error(f"Error saving feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")

@app.post("/api/test-insert")
async def test_insert():
    test_feedback = {
        "name": "John",
        "event": "Annual Meeting",
        "eventType": "Workshop",
        "comment": "Great event!",
        "rating": 5,
        "submissionDate": datetime.datetime.utcnow().isoformat(),
        "sentiment": "neutral" # Added sentiment and date for consistency
    }
    # Use await with the async insert_one method
    await collection.insert_one(test_feedback) # Added await
    return {"status": "Test data inserted!"}

@app.get("/api/test-retrieve")
async def test_retrieve():
    # Use await with the async find method and to_list
    data = await collection.find({}, {"_id": 0}).to_list(length=None) # Added await and to_list
    return {"feedback": data}

@app.get("/api/db-status")
async def db_status():
    try:
        # Use await with the async command method
        await db.admin.command('ping') # Added await
        return {"status": "ok"}
    except Exception as e:
        # In case of connection errors, this might still fail, but the structure is correct
        raise HTTPException(status_code=500, detail=str(e))

# New endpoints for event management (using database)
@app.get("/api/events")
async def get_events():
    try:
        # Get unique events from feedbacks collection using aggregation
        pipeline = [
            {"$group": {"_id": "$event"}},
            {"$project": {"_id": 0, "name": "$_id"}},
            {"$sort": {"name": 1}}
        ]
        # Use await with the async aggregate method and to_list
        events_cursor = collection.aggregate(pipeline) # Get cursor
        events_list = await events_cursor.to_list(length=None) # Convert to list
        
        # Filter out None or empty event names
        valid_events = [event["name"] for event in events_list if event and "name" in event and event["name"]]
        
        print(f"Successfully fetched events: {valid_events}") # Log success
        return {"events": valid_events }
    except Exception as e:
        print(f"Error fetching events from DB: {e}") # Log specific DB error
        # Return a 500 Internal Server Error with details
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {e}")

@app.post("/api/events")
async def add_event(event: Event):
    try:
        # Check if event already exists
        # Use await with the async find_one method
        existing_event = await collection.find_one({"event": event.name}) # Added await
        if existing_event:
            raise HTTPException(status_code=400, detail="Event already exists")

        # Add a dummy feedback entry to create the event in the collection
        # This ensures the event name appears in the unique events list fetched by aggregation
        dummy_feedback = {
            "name": "System",
            "event": event.name, # Store the new event name here
            "eventType": "Other", # Assign a default event type
            "comment": "Event created",
            "rating": 0,
            "sentiment": "neutral",
            "submissionDate": datetime.datetime.utcnow().isoformat() # Use ISO format
        }
        # Use await with the async insert_one method
        await collection.insert_one(dummy_feedback) # Added await

        return {"message": "Event added successfully", "event": event.name}
    except HTTPException as e:
        # Re-raise HTTPException to preserve status code and detail
        raise e
    except Exception as e:
        print(f"Error in add_event: {e}") # Log the error for debugging
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/events/{event_name}")
async def delete_event(event_name: str):
    try:
        # Delete all feedback entries for this event
        result = await collection.delete_many({"event": event_name})
        
        if result.deleted_count > 0:
            return {"message": f"Event '{event_name}' and its feedbacks deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=f"Event '{event_name}' not found")
            
    except Exception as e:
        print(f"Error deleting event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include existing routes
# app.include_router(router, prefix="/api") # Check if this is still needed or if all routes are in main.py now

# Consider adding a root endpoint
@app.get("/", include_in_schema=False)
async def read_root():
    return {"message": "FastAPI Sentiment Backend is running"}

@app.on_event("shutdown")
async def shutdown_db_client():
    if db:
        db.client.close()
        logger.info("MongoDB connection closed")