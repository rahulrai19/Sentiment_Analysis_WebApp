from fastapi import FastAPI, HTTPException, Request
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
MONGO_URI = os.getenv("MONGO_URI")

app = FastAPI(
    title="FastAPI Sentiment Backend",
    version="v1"
)

# Allow CORS from any origin (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

# Database connection
client = MongoClient(MONGO_URI)
db = client["feedbackDB"]
collection = db["feedback"]

# In-memory feedback store
feedback_data = []

# Sentiment analysis function
def analyze_sentiment(text):
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.2:
        return "Positive"
    elif polarity < -0.2:
        return "Negative"
    else:
        return "Neutral"

# Submit feedback endpoint
@app.post("/submit-feedback")
async def submit_feedback(request: Request):
    data = await request.json()
    feedback_text = data.get("feedback")
    if not feedback_text:
        raise HTTPException(status_code=400, detail="Feedback required")
    sentiment = analyze_sentiment(feedback_text)
    entry = {
        "feedback": feedback_text,
        "sentiment": sentiment
    }
    feedback_data.append(entry)
    return {"message": "Feedback received", "sentiment": sentiment}

# Get all feedbacks endpoint
@app.get("/feedbacks")
async def get_all_feedbacks():
    return feedback_data

# API endpoint to fetch feedback summary
@app.get("/api/feedback-summary")
async def feedback_summary():
    try:
        feedbacks = list(collection.find({}, {"_id": 0}))
        sentiments = {"positive": 0, "neutral": 0, "negative": 0}
        for feedback in feedbacks:
            if "sentiment" in feedback and feedback["sentiment"].lower() in sentiments:
                sentiments[feedback["sentiment"].lower()] += 1
        return {"sentiments": sentiments, "recent_feedback": feedbacks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include existing routes
app.include_router(router, prefix="/api")