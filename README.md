# Sentiment Analysis Web App

## 📌 Overview
This is a **React + FastAPI-powered sentiment analysis web app** that collects user feedback and determines sentiment using **VADER**. The backend is deployed on **Render**, and the frontend on **Netlify**.

## 🚀 Tech Stack
- **Frontend:** React, Axios, Netlify
- **Backend:** FastAPI, MongoDB, Render
- **Sentiment Analysis:** textBlob
- **Database:** MongoDB Atlas / Compass

## 🔧 Setup Guide
### 1️⃣ Clone Repository
```bash
git clone https://github.com/rahulrai19/Sentiment.git
cd Sentiment
```

### 2️⃣ Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4️⃣ Setup Environment Variables
Create a `.env` file for **MongoDB & API keys**:
```env
MONGO_URI=your-mongodb-url
API_BASE=https://your-backend-url
```

### 5️⃣ Run Locally
#### Backend (FastAPI):
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
#### Frontend (React):
```bash
npm start
```

## 🛠 Deployment Steps
1. **Push Changes to GitHub** → Auto-deploys on Netlify/Render
2. **Check Logs** for errors (`Render Dashboard → Logs`)
3. **Test API Calls** using Postman or curl

## 📌 Features
- ✅ User feedback form with real-time sentiment analysis
- ✅ Stores feedback in MongoDB
- ✅ Displays feedback insights in an Admin Dashboard
- ✅ Secure backend with API authentication

## 📜 License
MIT License.
