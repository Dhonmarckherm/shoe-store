# 🚀 Complete Deployment Guide: GitHub → Vercel + Render

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   (Vite/React)  │         │  (Node/Express) │
│   on Vercel     │◄───────►│   on Render     │
│   (HTTPS)       │  API    │   (HTTPS)       │
└─────────────────┘         └─────────────────┘
         │                          │
         │                          │
         ▼                          ▼
  https://your-app.vercel.app   https://your-api.onrender.com
```

**Why separate services?**
- **Vercel**: Best for static frontends (React, Vite, Next.js)
- **Render/Railway**: Best for Node.js backend APIs with database

---

## 📋 Prerequisites

1. **GitHub Account**: https://github.com
2. **Vercel Account**: https://vercel.com (sign up with GitHub)
3. **Render Account**: https://render.com (sign up with GitHub)
4. **MongoDB Atlas**: https://mongodb.com/cloud/atlas (free tier)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

Create `backend/render.yaml`:

```yaml
services:
  - type: web
    name: shoe-store-api
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 24h
      - key: ENCRYPTION_KEY
        generateValue: true
```

### Step 2: Update backend/.env for Production

Edit `backend/.env`:

```env
PORT=10000
HOST=0.0.0.0
HTTPS_ENABLED=false

# MongoDB Atlas (get from https://cloud.mongodb.com)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shoe-store?retryWrites=true&w=majority

# Security Keys (use strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
ENCRYPTION_KEY=your-32-character-encryption-key-change-this

NODE_ENV=production
```

### Step 3: Push to GitHub

```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shoe-store.git
git push -u origin main
```

### Step 4: Deploy to Render

1. Go to https://render.com and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: shoe-store-api
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
5. Add Environment Variables:
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add all variables from `.env` (MONGODB_URI, JWT_SECRET, etc.)
6. Click **"Create Web Service"**

**Wait 5-10 minutes** - Render will build and deploy your backend!

You'll get a URL like: `https://shoe-store-api-abc123.onrender.com`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Web API Configuration

Create `web/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Replace `your-backend-url` with your actual Render URL.

### Step 2: Update Vercel Configuration

The `web/vercel.json` file is already created. Update the backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.onrender.com/api/$1"
    }
  ]
}
```

### Step 3: Deploy to Vercel

**Option A: Deploy via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
6. Click **"Deploy"**

**Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to web folder
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\web

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 4: Configure Production URL

After deployment, Vercel will give you a URL like:
`https://shoe-store-xyz.vercel.app`

---

## Part 3: MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://cloud.mongodb.com
2. Sign up/Sign in
3. Create a **Free Cluster** (M0)
4. Choose region closest to you

### Step 2: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Create username and password
5. Set user privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Whitelist IP Address

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/shoe-store`

### Step 5: Update Render Environment Variables

1. Go to your Render dashboard
2. Click on your service
3. Click **"Environment"** tab
4. Update `MONGODB_URI` with the connection string
5. Click **"Save Changes"**

---

## Part 4: Update Mobile App Configuration

### Update API URL

Edit `mobile/src/services/api.js`:

```javascript
// For production, use your Render URL
const API_URL = 'https://your-backend-url.onrender.com/api';
```

### Rebuild Mobile App

```bash
cd mobile
npm start
```

---

## 🧪 Testing Your Deployment

### 1. Test Backend API

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Expected: {"success":true,"message":"Server is running",...}
```

### 2. Test Frontend

Open in browser: `https://your-app.vercel.app`

### 3. Test Full Flow

1. ✅ Open Vercel URL
2. ✅ Create account
3. ✅ Login
4. ✅ Browse products
5. ✅ Add to cart

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Render deployment fails
**Solution**: Check logs in Render dashboard → Logs tab

**Problem**: MongoDB connection error
**Solution**: 
- Verify connection string in Render environment variables
- Check IP whitelist in MongoDB Atlas

**Problem**: CORS errors
**Solution**: Update backend CORS configuration:

```javascript
// backend/server.js
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Frontend Issues

**Problem**: API calls fail
**Solution**: Check `VITE_API_URL` in Vercel environment variables

**Problem**: Build fails
**Solution**: Check build logs in Vercel dashboard → Deployments → View Logs

---

## 📊 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Frontend `.env.production` updated
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Mobile app API URL updated
- [ ] Test full user flow
- [ ] Test face recognition
- [ ] Test cart functionality

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | **Free** |
| Render | Free | **Free** (with limitations) |
| MongoDB Atlas | M0 | **Free** |
| **Total** | | **$0/month** |

**Note**: Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds to wake up.

---

## 🚀 Quick Deploy Commands

```bash
# 1. Push to GitHub
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy frontend
cd web
vercel --prod

# 3. Test backend
curl https://your-backend-url.onrender.com/health
```

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Docs**: https://www.mongodb.com/docs/atlas/

---

**Your app will be live at:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend-url.onrender.com/api`

🎉 Happy Deploying!
