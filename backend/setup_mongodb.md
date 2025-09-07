# MongoDB Setup Guide

## 🚨 Current Issue
Your MongoDB cluster `cluster0.rjs7riq.mongodb.net` is not accessible. This could be due to:
- Cluster being deleted or paused
- Incorrect connection string
- Network/DNS issues

## 🔧 Quick Fix Options

### Option 1: Create New MongoDB Atlas Cluster (Recommended)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Sign in** or create a new account
3. **Create a new cluster**:
   - Choose "Free" tier (M0)
   - Select a region close to your users
   - Name it something like `sentiment-cluster`

4. **Set up database access**:
   - Go to "Database Access"
   - Add a new user with read/write permissions
   - Username: `sentiment-user`
   - Password: Generate a strong password

5. **Set up network access**:
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (for Render deployment)
   - Or add Render's IP ranges

6. **Get connection string**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Option 2: Use Fallback Mode (Temporary)

The application now has fallback mode enabled, so it will work without MongoDB using in-memory storage. However, data will be lost when the server restarts.

### Option 3: Use MongoDB Local (Development Only)

For local development, you can install MongoDB locally:
```bash
# On Windows (using Chocolatey)
choco install mongodb

# On macOS (using Homebrew)
brew install mongodb-community

# Start MongoDB service
mongod
```

## 🔑 Setting Environment Variables on Render

1. **Go to your Render dashboard**
2. **Select your backend service**
3. **Go to "Environment" tab**
4. **Add/Update these variables**:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/feedbackDB?retryWrites=true&w=majority
```

Replace:
- `<username>`: Your MongoDB username
- `<password>`: Your MongoDB password
- `<cluster>`: Your cluster name (e.g., `sentiment-cluster.abc123`)

## 🧪 Test Connection

After setting up MongoDB, test the connection:

```bash
# Test health endpoint
curl https://your-render-url.com/health

# Expected response:
{
  "status": "healthy",
  "database": "connected"
}
```

## 📊 Monitoring

The application now includes:
- **Fallback mode**: Works without MongoDB
- **Health checks**: Shows database status
- **Better error handling**: Won't crash on connection issues
- **Logging**: Detailed connection attempt logs

## 🚀 Deployment Commands

```bash
# Deploy with new MongoDB URI
# Update MONGO_URI in Render environment variables
# The app will automatically restart and connect
```

## 🔍 Troubleshooting

If you still have issues:

1. **Check MongoDB Atlas status**: https://status.cloud.mongodb.com/
2. **Verify connection string format**
3. **Check network access settings**
4. **Review Render logs** for specific error messages
5. **Test connection locally** first

## 📝 Example Connection Strings

### MongoDB Atlas (Cloud)
```
mongodb+srv://sentiment-user:yourpassword@sentiment-cluster.abc123.mongodb.net/feedbackDB?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/feedbackDB
```

### MongoDB with Authentication
```
mongodb://username:password@localhost:27017/feedbackDB
```
