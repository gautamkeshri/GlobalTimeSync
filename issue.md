# Cloudflare Deployment Issue

## Issue

The application was failing to deploy to Cloudflare Workers with the following error:

```
Uncaught Error: No such module "node:fs".
```

This was happening because the Cloudflare Workers runtime does not support the `node:fs` module, which was being imported by the application.

## Solution

The solution was to refactor the code to avoid importing the `fs` module in the production build. This was done by:

1.  Dynamically importing the `server/vite.ts` file only in development mode.
2.  Moving the `log` function to a separate `server/logger.ts` file.
3.  Moving the `serveStatic` function to a separate `server/static.ts` file.

This ensures that the `fs` module is only imported when running the application in development mode, and not in the production build that is deployed to Cloudflare Workers.
