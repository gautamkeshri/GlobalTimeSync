# Deploying TimeSync to Cloudflare Workers and Pages

This guide walks you through deploying the TimeSync application to Cloudflare infrastructure.

## Architecture Overview

The deployment uses two Cloudflare services:
- **Cloudflare Workers**: Hosts the API backend and WebSocket connections via Durable Objects
- **Cloudflare Pages**: Serves the static React frontend

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Install globally with `npm install -g wrangler`
4. **Authentication**: Run `wrangler login` to authenticate

## Step 1: Build the Application

### Build the Worker (API Backend)
```bash
npm run build:worker
```

This creates `dist/worker.js` containing the API routes and WebSocket Durable Object.

### Build the Frontend
```bash
npm run build:pages
```

This creates static assets in `dist/public/`.

## Step 2: Deploy the Worker

The Worker handles all API routes and WebSocket connections.

### Deploy to Cloudflare Workers
```bash
npm run deploy:worker
# Or manually:
wrangler deploy
```

This command will:
1. Upload your worker code to Cloudflare
2. Create the WebSocket Durable Object
3. Provide you with a worker URL (e.g., `https://globalsync.YOUR_SUBDOMAIN.workers.dev`)

**Important**: Copy the worker URL - you'll need it for the Pages deployment.

### Configure Environment Variables (Optional)

If using Firebase authentication:
```bash
wrangler secret put VITE_FIREBASE_API_KEY
wrangler secret put VITE_FIREBASE_PROJECT_ID
wrangler secret put VITE_FIREBASE_APP_ID
```

## Step 3: Deploy the Frontend to Pages

### Option A: Deploy via Wrangler CLI
```bash
npm run deploy:pages
# Or manually:
wrangler pages deploy dist/public --project-name=globalsync
```

### Option B: Deploy via Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** > **Pages**
2. Click **Create a project**
3. Connect your GitHub repository (or use Direct Upload)
4. Configure build settings:
   - **Build command**: `npm run build:pages`
   - **Build output directory**: `dist/public`
   - **Root directory**: `/`

## Step 4: Connect Pages to Worker

You have two options to connect the frontend to the backend:

### Option A: Service Bindings (Recommended)

1. Go to **Pages** > **Your Project** > **Settings** > **Functions**
2. Add a **Service Binding**:
   - Variable name: `API`
   - Service: `globalsync` (your worker name)
3. Add routing rules in Pages:
   - Create `client/public/_worker.js`:
   ```javascript
   export default {
     async fetch(request, env) {
       const url = new URL(request.url);

       // Route API requests to the Worker
       if (url.pathname.startsWith('/api') || url.pathname === '/ws') {
         return env.API.fetch(request);
       }

       // Serve static assets from Pages
       return env.ASSETS.fetch(request);
     }
   };
   ```

### Option B: Custom Domain with Route (Simpler)

1. Update your frontend code to point to the Worker URL:
   - In `client/src/lib/queryClient.ts` or wherever API calls are made
   - Set `API_BASE_URL = 'https://globalsync.YOUR_SUBDOMAIN.workers.dev'`

2. Rebuild and redeploy:
   ```bash
   npm run build:pages
   npm run deploy:pages
   ```

## Step 5: Configure CORS (If using Option B)

Update `worker/index.ts` CORS headers to allow your Pages domain:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-project.pages.dev',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, user-id',
};
```

Then redeploy the worker:
```bash
npm run deploy:worker
```

## Step 6: Custom Domain (Optional)

### Add Custom Domain to Pages
1. Go to **Pages** > **Your Project** > **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `timesync.yourdomain.com`)
4. Follow DNS configuration instructions

### Add Custom Domain to Worker (for API)
1. Go to **Workers** > **Your Worker** > **Triggers**
2. Click **Add Custom Domain**
3. Enter subdomain (e.g., `api.timesync.yourdomain.com`)

## Testing the Deployment

1. **Visit your Pages URL**: `https://your-project.pages.dev`
2. **Test Guest Login**: Click "Continue as Guest"
3. **Check API Connection**: Open browser DevTools > Network tab
4. **Verify WebSocket**: Look for WebSocket connection in Network tab

## Troubleshooting

### Worker Build Fails
- **Error**: "Could not resolve 'fs'"
  - **Solution**: This means Node.js code is being bundled. Check that `build:worker` script excludes all Node.js dependencies.

### CORS Errors
- **Issue**: Frontend can't reach Worker API
  - **Solution**: Update CORS headers in `worker/index.ts` to include your Pages domain

### Durable Objects Error
- **Issue**: WebSocket connections fail
  - **Solution**: Ensure migrations have run. Check Cloudflare dashboard > Workers > Durable Objects

### Environment Variables Not Working
- **Issue**: Firebase auth fails
  - **Solution**: Set secrets via `wrangler secret put` or in Cloudflare dashboard

## Local Development with Wrangler

Test the worker locally before deploying:

```bash
npm run dev:worker
```

This starts a local Cloudflare Workers environment at `http://localhost:8787`

## Useful Commands

```bash
# View worker logs
wrangler tail

# List deployed workers
wrangler deployments list

# Delete a deployment
wrangler delete

# List Durable Object instances
wrangler durable-objects:list WEBSOCKET_SERVER

# Open Pages dashboard
wrangler pages dashboard
```

## Cost Considerations

### Free Tier Includes:
- **Workers**: 100,000 requests/day
- **Durable Objects**: 1 million requests/month
- **Pages**: Unlimited requests and bandwidth

### Paid Plans Start At:
- **Workers**: $5/month for 10 million requests
- **Durable Objects**: $5/month for 1 million requests

## Monitoring

1. **Cloudflare Dashboard**: View analytics, logs, and errors
2. **Wrangler Tail**: Live log streaming with `wrangler tail`
3. **Browser DevTools**: Monitor API calls and WebSocket connections

## Next Steps

1. **Set up CI/CD**: Use GitHub Actions to auto-deploy on push
2. **Add Database**: Integrate Cloudflare D1 (SQLite) or KV for persistent storage
3. **Enable Analytics**: Use Cloudflare Analytics to monitor usage
4. **Set up Alerts**: Configure email alerts for errors and downtime

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
