# Deployment Guide: Railway + Vercel

This guide will help you deploy the Subscription Manager app with Railway (backend) and Vercel (frontend).

## Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Git repository with your code

## Part 1: Deploy Backend to Railway

### 1. Push Code to GitHub
```bash
cd /path/to/subscription-manager
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/subscription-manager.git
git push -u origin main
```

### 2. Create Railway Project
1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your subscription-manager repository
5. Select the `backend` folder as the root directory

### 3. Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will automatically provide `DATABASE_URL` environment variable

### 4. Configure Environment Variables
In Railway project settings → Variables, add:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
CORS_ORIGIN=https://your-app.vercel.app
PORT=3001
```

### 5. Deploy
- Railway will automatically deploy from the `main` branch
- Check logs for any deployment issues
- Your backend will be available at: `https://your-project.railway.app`

## Part 2: Deploy Frontend to Vercel

### 1. Deploy to Vercel
1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set Root Directory to `frontend`
5. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables
In Vercel project settings → Environment Variables, add:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### 3. Update CORS in Railway
Go back to Railway and update the `CORS_ORIGIN` variable:
```
CORS_ORIGIN=https://your-app.vercel.app
```

## Part 3: Test Deployment

### 1. Test Backend
```bash
curl https://your-backend.railway.app/health
```

### 2. Test Frontend
Visit your Vercel URL and try:
- User registration
- User login
- Creating subscriptions
- Viewing dashboard

## Part 4: Database Setup

The database will be automatically migrated on first deployment. If you need to seed data:

1. In Railway dashboard, go to your backend service
2. Open the "Variables" tab
3. Add temporary variable: `RAILWAY_RUN_SEED=true`
4. Redeploy the service
5. Remove the variable after seeding

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure `CORS_ORIGIN` in Railway matches your Vercel URL exactly
2. **Database Connection**: Check that PostgreSQL is running and `DATABASE_URL` is set
3. **API Not Found**: Verify `NEXT_PUBLIC_API_URL` points to your Railway backend
4. **Build Failures**: Check Railway logs for specific error messages

### Environment Variables Checklist:

**Railway (Backend):**
- ✅ `DATABASE_URL` (auto-provided by PostgreSQL addon)
- ✅ `NODE_ENV=production`
- ✅ `JWT_SECRET` (secure random string)
- ✅ `CORS_ORIGIN` (your Vercel frontend URL)

**Vercel (Frontend):**
- ✅ `NEXT_PUBLIC_API_URL` (your Railway backend URL + /api)

## Domain Setup (Optional)

### Custom Domain for Frontend:
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update `CORS_ORIGIN` in Railway accordingly

### Custom Domain for Backend:
1. In Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_API_URL` in Vercel

## Monitoring

- **Railway**: Check service logs and metrics in dashboard
- **Vercel**: Monitor function logs and analytics
- **Database**: Use Railway's built-in database browser

Your app should now be live! 🚀