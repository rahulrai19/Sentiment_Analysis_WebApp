from fastapi import FastAPI, HTTPException, Request
from .routes.api import router
from .middleware.logging import LoggingMiddleware
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from pydantic import BaseModel
import datetime
from typing import List, Optional
import motor.motor_asyncio
from bson import ObjectId

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = FastAPI(
    title="FastAPI Sentiment Backend",
    version="v1"
)

# Allow CORS from any origin (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://verbose-feedbacker.netlify.app",
        "*" # Temporarily allow all origins for easier testing, adjust for production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

# Database connection (using motor for async)
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)

# Access the database (MongoDB creates it on first write)
db = client["feedbackDB"]

# Access the collection (MongoDB creates it on first write)
collection = db["feedback"]

# Sentiment analysis function
def analyze_sentiment(text):
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.2:
        return "Positive"
    elif polarity < -0.2:
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

# Get all feedbacks endpoint (using database)
@app.get("/feedbacks")
async def get_all_feedbacks():
    # Return all feedbacks from MongoDB
    # Use await with the async find method and to_list
    data = await collection.find({}, {"_id": 0}).to_list(length=None) # Added await and to_list
    return data

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
    
    # Use await with the async insert_one method
    await collection.insert_one(feedback_dict) # Added await
    
    return {"status": "Feedback saved!", "sentiment": sentiment}

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
        await client.admin.command('ping') # Added await
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