# 🚀 Deployment Guide

This guide covers deploying the Cake Selling App to Vercel (Frontend) and Render (Backend).

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas database

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Your Repository

Ensure your repository has the `vercel.json` file in the root directory:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "cd client && pnpm build",
  "outputDirectory": "client/dist",
  "installCommand": "cd client && pnpm install"
}
```

### Step 2: Connect to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Vercel will automatically detect the configuration from `vercel.json`**

### Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for the build to complete**
3. **Your app will be live at `https://your-app.vercel.app`**

### Step 5: Test Routing

After deployment, test these scenarios:

- ✅ Navigate to homepage
- ✅ Click internal links
- ✅ **Direct URL access**: `https://your-app.vercel.app/dashboard/customer`
- ✅ **Page refresh on any route**: Should work without 404 errors
- ✅ **Browser back/forward buttons**: Should work correctly

## 🔧 Backend Deployment (Render)

### Step 1: Connect to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**

### Step 2: Configure Build Settings

```
Name: cake-selling-backend
Environment: Node
Build Command: cd server && pnpm install
Start Command: cd server && pnpm start
```

### Step 3: Set Environment Variables

```
NODE_ENV=production
PORT=10000
MONGO_URI_PRODUCTION=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
JWT_SECRET=your-super-secret-jwt-key
```

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment to complete**
3. **Your API will be live at `https://your-service.onrender.com`**

## 🔗 Connecting Frontend to Backend

### Update API Configuration

In your frontend, ensure the API URL points to your deployed backend:

```javascript
// client/src/utils/api.js
const getApiBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:5000/api";
  }
  return "https://your-backend-service.onrender.com/api";
};
```

### Set Environment Variable

In Vercel dashboard, set:
```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## 🧪 Testing Your Deployment

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Navigation between pages works
- [ ] Direct URL access works (e.g., `/dashboard/customer`)
- [ ] Page refresh works on any route
- [ ] API calls to backend work

### Backend Tests
- [ ] API endpoints respond correctly
- [ ] Database connection works
- [ ] Authentication works
- [ ] File uploads work
- [ ] CORS is configured properly

## 🔍 Troubleshooting

### Common Issues

#### 1. **404 Errors on Direct URL Access**
**Problem**: Users get 404 when accessing routes directly
**Solution**: Ensure `vercel.json` has the correct rewrite rule

#### 2. **API Calls Failing**
**Problem**: Frontend can't connect to backend
**Solution**: 
- Check CORS configuration in backend
- Verify API URL in frontend
- Check environment variables

#### 3. **Build Failures**
**Problem**: Vercel build fails
**Solution**:
- Check `package.json` scripts
- Verify all dependencies are installed
- Check for syntax errors

#### 4. **Database Connection Issues**
**Problem**: Backend can't connect to MongoDB
**Solution**:
- Verify MongoDB connection string
- Check network access in MongoDB Atlas
- Ensure environment variables are set correctly

### Debug Commands

#### Check Vercel Build Logs
```bash
# In Vercel dashboard, check build logs for errors
```

#### Test API Locally
```bash
# Test backend API
curl https://your-backend.onrender.com/api/cakes
```

#### Check Environment Variables
```bash
# In Vercel dashboard, verify all environment variables are set
```

## 📊 Monitoring

### Vercel Analytics
- Monitor page views and performance
- Check for 404 errors
- Track user behavior

### Render Monitoring
- Monitor API response times
- Check for server errors
- Track resource usage

## 🔄 Continuous Deployment

### Automatic Deployments
- **Vercel**: Automatically deploys on every push to main branch
- **Render**: Automatically deploys on every push to main branch

### Manual Deployments
- **Vercel**: Go to dashboard → Project → Deployments → Redeploy
- **Render**: Go to dashboard → Service → Manual Deploy

## 🎯 Best Practices

1. **Environment Variables**: Never commit sensitive data to Git
2. **Testing**: Test thoroughly before deploying to production
3. **Monitoring**: Set up alerts for errors and performance issues
4. **Backups**: Regular database backups
5. **Security**: Use HTTPS, secure JWT secrets, and proper CORS

## 📞 Support

If you encounter issues:

1. **Check the logs** in Vercel/Render dashboards
2. **Verify environment variables** are set correctly
3. **Test locally** to isolate issues
4. **Check documentation** for each platform
5. **Contact support** if needed

---

**Happy Deploying! 🚀** 