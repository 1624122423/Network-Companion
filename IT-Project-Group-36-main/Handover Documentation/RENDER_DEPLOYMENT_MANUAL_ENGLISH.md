# Render Frontend and Backend Deployment Manual

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Flask)](#backend-deployment-flask)
3. [Frontend Deployment (React + Vite + Nginx)](#frontend-deployment-react--vite--nginx)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Information
- ✅ GitHub account (connected to Render)
- ✅ Git repository URL
- ✅ Backend API URL (obtained after deployment)
- ✅ Firebase configuration

### Project Structure Requirements
```
IT-Project-Group-36/
├── flask-server/                 ← Backend
│   ├── requirements.txt
│   ├── app.py
│   ├── Dockerfile
│   └── ...
├── react-web-app/                ← Frontend
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.production
│   └── ...
└── .gitignore
```

---

## Backend Deployment (Flask)

### Step 1: Prepare Backend Code

**Verify `flask-server/app.py`**
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

✅ Ensure the server binds to `0.0.0.0` and the `$PORT` environment variable

**Verify `flask-server/requirements.txt`**
```
Flask==2.3.0
Flask-CORS==4.0.0
gunicorn==20.1.0
python-dotenv==1.0.0
# ... other dependencies
```

**Ensure Dockerfile exists**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:$PORT", "app:app"]
```

### Step 2: Create Backend Service on Render

1. **Log in to Render** → https://dashboard.render.com
2. **Click "New +"** → Select **"Web Service"**
3. **Connect GitHub Repository**
   - Select your repository
   - Authorize GitHub access if this is your first time

4. **Fill in Service Information**
   - **Name**: `it-project-group-36-backend`
   - **Root Directory**: `flask-server/`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `flask-server/Dockerfile`
   - **Build Context**: `flask-server/`

5. **Configure Build and Start Commands**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`

6. **Set Environment Variables** (click "Environment")
   ```
   FLASK_ENV=production
   DATABASE_URL=your-database-url
   # Other required environment variables
   ```

7. **Click "Create Web Service"**

⏳ **Wait for deployment to complete** (usually takes 5-10 minutes)

### Step 3: Record Backend URL

✅ After successful deployment, you'll see:
```
Available at: https://it-project-group-36-backend.onrender.com
```

**Save this URL** - the frontend will need it!

---

## Frontend Deployment (React + Vite + Nginx)

### Step 1: Prepare Frontend Code

**Verify `react-web-app/.env.production`**
```
VITE_API_URL=https://it-project-group-36-backend.onrender.com
```

⚠️ **Replace with your actual backend URL!**

**Verify `react-web-app/src/api.js`**

Ensure line 16:
```javascript
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';
```

And line 31:
```javascript
console.log("API Base URL:", API_BASE)  // ✅ Must be API_BASE, not baseURL
```

**Verify `react-web-app/nginx.conf`**
```nginx
server {
    listen 80;  # ✅ Must use port 80
    server_name _;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;  # Required for React Router
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Verify `react-web-app/Dockerfile`**
```dockerfile
# Stage 1: Build frontend
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . ./

# Build
RUN npm run build

# Stage 2: Nginx server
FROM nginx:alpine

# Install dependencies
RUN apk add --no-cache \
    bash \
    git \
    openssh \
    libstdc++

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create Frontend Service on Render

1. **Log in to Render** → https://dashboard.render.com
2. **Click "New +"** → Select **"Web Service"**
3. **Connect the same GitHub repository**

4. **Fill in Service Information**
   - **Name**: `it-project-group-36-frontend`
   - **Root Directory**: `react-web-app/`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `react-web-app/Dockerfile`
   - **Build Context Directory**: `react-web-app/`

5. **Configure Build and Start Commands**
   - **Build Command**: (leave empty, use Dockerfile)
   - **Start Command**: (leave empty, use Dockerfile)

6. **Set Environment Variables** (click "Environment")
   ```
   VITE_API_URL=https://it-project-group-36-backend.onrender.com
   ```

7. **Click "Create Web Service"**

⏳ **Wait for deployment to complete** (usually takes 5-10 minutes)

### Step 3: Record Frontend URL

✅ After successful deployment, you'll see:
```
Available at: https://it-project-group-36-frontend.onrender.com
```

This is your frontend application address!

---

## Environment Variables Configuration

### Backend Environment Variables

Add these in the Render backend service "Environment" section:

```
# Flask configuration
FLASK_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# API keys
SECRET_KEY=your-secret-key-here

# Firebase (if backend also uses Firebase)
FIREBASE_API_KEY=your-firebase-key
FIREBASE_PROJECT_ID=your-project-id
```

### Frontend Environment Variables

Add these in the Render frontend service "Environment" section:

```
VITE_API_URL=https://it-project-group-36-backend.onrender.com
```

---

## Post-Deployment Checklist

### Backend Checks

- [ ] Backend service is deployed and status is "Live"
- [ ] Can access backend URL (if public endpoint exists)
- [ ] No errors in logs
- [ ] Database connection is working (check logs)

### Frontend Checks

- [ ] Frontend service is deployed and status is "Live"
- [ ] Can access frontend URL and see the application
- [ ] No `baseURL is not defined` error in browser Console
- [ ] Network tab shows API requests to backend
- [ ] API responses have 2xx status codes

### CORS Checks

If frontend cannot call backend API, verify backend has CORS configured:

**Backend `app.py`:**
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {
    "origins": [
        "https://it-project-group-36-frontend.onrender.com",
        "http://localhost:5173",  # Local development
    ]
}})
```

---

## Troubleshooting

### Issue 1: Frontend Shows Blank Page

**Check:**
1. Open browser Developer Tools (F12)
2. Look at Console tab for errors

**Common Causes:**
- ❌ `baseURL is not defined` → Check line 31 in `src/api.js`
- ❌ API connection failed → Check `VITE_API_URL` in `.env.production`
- ❌ JavaScript errors → Check Vite build logs

**Fix:**
```bash
cd react-web-app
npm run build  # Test locally
git add .
git commit -m "Fix API configuration"
git push
```

### Issue 2: Backend API Returns 403 or CORS Error

**Check:**
- Is CORS properly configured in backend?
- Is the frontend requesting the correct URL?

**Fix:**
Add CORS configuration to backend `app.py`:
```python
from flask_cors import CORS
CORS(app)
```

### Issue 3: Environment Variables Not Applied

**Solution:**
1. Verify environment variables are correctly set in Render
2. Redeploy service (Render typically requires redeployment for env changes to take effect)
3. In Render, click "Manual Deploy" to force redeployment

### Issue 4: Docker Build Fails

**Check Build Logs:**
- Service page → "Logs" tab
- Look for errors in "npm install" or "pip install"

**Common Causes:**
- Dependency installation failed → Check `package.json` or `requirements.txt`
- Incorrect Dockerfile path → Verify "Dockerfile Path" setting

---

## Auto-Deploy Configuration

### Enable Auto-Deployment

**For both backend and frontend, configure auto-deploy:**

1. On the service page, find "Auto-Deploy"
2. Set to **"On Commit"**
3. Render will automatically redeploy whenever you push to main branch

✅ Recommended Configuration:
- **Branch**: `main`
- **Auto-Deploy**: `On Commit`

### Manual Deployment

If you need to manually deploy (e.g., after updating environment variables):
1. Open the service page
2. Click "Manual Deploy" or click the button next to "Rollback" in logs

---

## Monitoring and Maintenance

### View Logs

**Backend Logs:**
1. Open backend service
2. Click "Logs" tab
3. View real-time logs

**Frontend Logs:**
1. Open frontend service
2. Click "Logs" tab
3. View Nginx and build logs

### Monitor Services

**Check service status:**
- Render Dashboard shows all services on the left
- Green ✅ = Running normally
- Red ❌ = Error (check logs)

### Upgrade Service (Optional)

If you experience performance issues:
1. Open service
2. Click "Settings" in top right
3. Scroll down to "Plan" section
4. Upgrade to higher tier

---

## Quick Reference Code Snippets

### Frontend API Base URL Setup

**`react-web-app/src/api.js`**
```javascript
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';
console.log("API Base URL:", API_BASE)  // ✅ Correct variable name
```

### Frontend Environment Variable

**`react-web-app/.env.production`**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend CORS Configuration

**`flask-server/app.py`**
```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-url.onrender.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## Successful Deployment Indicators

✅ **Signs of completely successful deployment:**

1. **Frontend page loads normally**
   - Access frontend URL and see the application
   - Page content displays correctly

2. **API calls succeed**
   - No errors in Console
   - API requests in Network tab show 200/201/204 status codes
   - Data returns correctly

3. **Logs are clean**
   - Backend logs show requests are handled correctly
   - Frontend logs have no error messages

4. **Features work**
   - Login/signup works
   - Data CRUD operations work
   - Real-time features (if any) work correctly

---

## Common Render Links

- 📊 Dashboard: https://dashboard.render.com
- 📖 Documentation: https://render.com/docs
- 🆘 Support: https://support.render.com

---

## Deployment Summary Table

| Component | URL | Port | Build Context |
|-----------|-----|------|----------------|
| **Backend** | `https://it-project-group-36-backend.onrender.com` | $PORT (auto) | `flask-server/` |
| **Frontend** | `https://it-project-group-36-frontend.onrender.com` | 80 | `react-web-app/` |
| **API Endpoint** | `https://it-project-group-36-backend.onrender.com/api` | - | - |

---

## Deployment Workflow

### First Time Deployment
1. ✅ Deploy backend service
2. ✅ Record backend URL
3. ✅ Update `VITE_API_URL` in frontend `.env.production`
4. ✅ Deploy frontend service
5. ✅ Test frontend application

### Update Workflow
1. Make code changes locally
2. Commit and push to Git: `git push origin main`
3. Render automatically detects changes and redeploys
4. Check "Logs" tab to verify deployment success

### Environment Variable Update Workflow
1. Update environment variables in Render
2. Click "Manual Deploy" to force redeployment
3. Check logs to verify changes are applied

---

**Happy Deploying! 🚀**
