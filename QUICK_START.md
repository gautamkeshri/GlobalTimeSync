# TimeSync - Quick Start Guide

## 🌐 Your Live Application

**Frontend**: https://globalsync-59k.pages.dev
**API**: https://globalsync.gautamkeshri.workers.dev
**WebSocket**: wss://globalsync.gautamkeshri.workers.dev/ws

## 🚀 Quick Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start local dev server (http://localhost:5000)
```

### Cloudflare Deployment
```bash
npm run build:worker      # Build API Worker
npm run build:pages       # Build frontend
npm run deploy:worker     # Deploy Worker to Cloudflare
npm run deploy:pages      # Deploy Pages to Cloudflare
bash deploy.sh            # Deploy everything at once
```

### Testing
```bash
npm run check             # TypeScript type checking
npm run dev:worker        # Test Worker locally
npx wrangler tail         # View live Worker logs
```

## 📂 Project Structure

```
GlobalTimeSync/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── contexts/     # Auth, Timezone, Theme contexts
│   │   ├── pages/        # dashboard, auth, shared-team
│   │   └── lib/          # Utils, queryClient, Firebase
│   └── public/
│       ├── _worker.js    # Pages Function (routes to Worker)
│       └── _routes.json  # Pages routing config
├── server/               # Express backend (local dev only)
│   ├── routes.ts
│   ├── storage.ts
│   └── websocket.ts
├── worker/               # Cloudflare Worker (production)
│   ├── index.ts          # Worker entry + API routes
│   ├── storage.ts        # Worker-compatible storage
│   └── websocket-server.ts  # Durable Object
├── shared/
│   └── schema.ts         # Shared types & Drizzle schemas
└── wrangler.toml         # Cloudflare config
```

## 🔑 Key Features

✅ **Multi-timezone tracking** - View multiple time zones simultaneously
✅ **Interactive time slider** - Adjust time across all zones
✅ **Team collaboration** - Share timezone collections
✅ **Guest mode** - No authentication required
✅ **Firebase auth** - Optional Google sign-in
✅ **WebSocket sync** - Real-time updates via Durable Objects
✅ **Dark/Light theme** - Toggle with system preference

## 📖 Documentation

- **[DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md)** - Deployment details & next steps
- **[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)** - Full deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - Architecture & development guide
- **[README.md](./README.md)** - General project overview

## 🎯 Common Tasks

### Update Code & Redeploy
```bash
# Make your changes, then:
npm run build:worker && npm run deploy:worker  # For API changes
npm run build:pages && npm run deploy:pages    # For frontend changes
```

### View Logs
```bash
npx wrangler tail              # Live logs
npx wrangler deployments list  # Deployment history
```

### Set Environment Variables
```bash
npx wrangler secret put VITE_FIREBASE_API_KEY
npx wrangler secret put VITE_FIREBASE_PROJECT_ID
npx wrangler secret put VITE_FIREBASE_APP_ID
```

### Custom Domain
1. **Cloudflare Dashboard** > **Pages** > **globalsync** > **Custom domains**
2. Click **Set up a custom domain**
3. Follow DNS instructions

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Update CORS headers in `worker/index.ts` |
| API 404 errors | Check `_worker.js` routing configuration |
| WebSocket won't connect | Verify Durable Objects in Cloudflare dashboard |
| Old version showing | Clear browser cache, wait for CDN update |

## 💡 Pro Tips

1. **Data Persistence**: Currently in-memory. Add Cloudflare D1/KV for permanent storage
2. **CI/CD**: GitHub Actions workflow is ready - just add `CLOUDFLARE_API_TOKEN` secret
3. **Monitoring**: Check Cloudflare Analytics for usage and performance
4. **Cost**: Free tier includes 100K Worker requests/day - plenty for most apps!

## 🆘 Get Help

- [Cloudflare Docs](https://developers.cloudflare.com)
- [Workers Discord](https://discord.cloudflare.com)
- [GitHub Issues](https://github.com/YOUR_USERNAME/GlobalTimeSync/issues)

---

**Status**: ✅ **LIVE AND READY!**
**Last Updated**: October 24, 2025
