from fastapi import FastAPI, HTTPException
from .routes.api import router
from .middleware.logging import LoggingMiddleware
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from pymongo import MongoClient

# Load environment variables
load_dotenv()

app = FastAPI(
    title=os.getenv("APP_NAME", "FastAPI Backend"),
    version=os.getenv("API_VERSION", "v1")
)

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://verbose-feedbacker.netlify.app/"],  # Replace with your actual Netlify URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

# Database connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["feedbackDB"]
collection = db["feedback"]

# Sentiment analyzer setup
analyzer = SentimentIntensityAnalyzer()

# Function to analyze sentiment
def analyze_sentiment(text):
    vader_score = analyzer.polarity_scores(text)['compound']
    textblob_score = TextBlob(text).sentiment.polarity
    return "Positive" if vader_score > 0.05 and textblob_score > 0 else "Negative"

@app.get("/")
def read_root():
    return {
        "message": "Hello World from FastAPI!",
        "app_name": os.getenv("APP_NAME", "FastAPI Backend"),
        "version": os.getenv("API_VERSION", "v1")
    }

# API endpoint to submit feedback
@app.post("/api/submit-feedback")
async def submit_feedback(feedback_data: dict):
    try:
        sentiment = analyze_sentiment(feedback_data["comment"])
        collection.insert_one({
            "name": feedback_data["name"],
            "event": feedback_data["event"],
            "comment": feedback_data["comment"],
            "sentiment": sentiment
        })
        return {"event": feedback_data["event"], "sentiment": sentiment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API endpoint to fetch feedback summary
@app.get("/api/feedback-summary")
async def feedback_summary():
    try:
        feedbacks = list(collection.find({}, {"_id": 0}))
        sentiments = {"positive": 0, "neutral": 0, "negative": 0}
        
        for feedback in feedbacks:
            sentiments[feedback["sentiment"].lower()] += 1

        return {"sentiments": sentiments, "recent_feedback": feedbacks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include existing routes
app.include_router(router, prefix="/api")