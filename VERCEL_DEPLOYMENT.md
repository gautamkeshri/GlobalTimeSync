# Deploying TimeSync to Vercel

Your TimeSync application is a full-stack app with Express.js backend and React frontend. Here are your deployment options:

## Option 1: Split Deployment (Recommended)

### Frontend (Vercel) + Backend (Railway/Render)

1. **Deploy Frontend to Vercel:**
   ```bash
   # In your project root
   npm run build
   ```
   - Connect your GitHub repo to Vercel
   - Set build command: `vite build`
   - Set output directory: `dist`
   - Set environment variables in Vercel dashboard

2. **Deploy Backend Separately:**
   - Use Railway, Render, or Heroku for the Express.js backend
   - Update frontend API calls to point to your backend URL

### Required Changes for Split Deployment:

1. **Update API Base URL:**
   ```typescript
   // In client/src/lib/queryClient.ts
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-backend.railway.app' 
     : '';
   ```

2. **Environment Variables for Vercel:**
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

## Option 2: Vercel Serverless Functions

### Required File Changes:

1. **Create vercel.json:**
   ```json
   {
     "functions": {
       "api/*.ts": {
         "runtime": "nodejs18.x"
       }
     },
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       }
     ]
   }
   ```

2. **Convert Routes to Serverless Functions:**
   Each route becomes a separate file in `/api/` directory:
   - `/api/auth/guest.ts`
   - `/api/timezones.ts`
   - `/api/timezones/[id].ts`

3. **Limitations with Serverless:**
   - **No WebSocket support** (real-time features won't work)
   - **Cold starts** (slower initial response)
   - **Stateless** (no persistent connections)

## Option 3: Keep on Replit (Easiest)

Your current setup works perfectly on Replit with:
- Full WebSocket support for real-time features
- Integrated database
- No deployment complexity

**To deploy on Replit:**
1. Click the "Deploy" button in your Replit
2. Choose "Autoscale" for better performance
3. Configure custom domain if needed

## Recommended Approach

For your timezone management app with real-time features:

1. **Development:** Keep using Replit (current setup)
2. **Production:** Consider split deployment:
   - Frontend: Vercel (fast global CDN)
   - Backend: Railway or Render (full Node.js support)

This preserves all your real-time WebSocket features while getting the benefits of Vercel's frontend performance.

## Database Considerations

Your app uses Neon PostgreSQL which works with all deployment options. Make sure to:
1. Set `DATABASE_URL` environment variable
2. Run database migrations: `npm run db:push`
3. Update connection settings for production

## Next Steps

1. Choose your deployment strategy
2. Set up environment variables
3. Test the deployment
4. Update DNS/domain settings

Would you like me to help implement any of these deployment options?