// Cloudflare Pages Middleware to route API requests to Worker

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Route API and WebSocket requests to the Worker
  if (url.pathname.startsWith('/api') || url.pathname === '/ws') {
    // Option 1: Using Service Binding (if configured in Pages settings)
    if (env.API) {
      return env.API.fetch(request);
    }

    // Option 2: Direct Worker URL (fallback)
    const workerUrl = 'https://globalsync.gautamkeshri.workers.dev';
    const targetUrl = workerUrl + url.pathname + url.search;

    // Clone the request with the new URL
    const workerRequest = new Request(targetUrl, request);

    try {
      const response = await fetch(workerRequest);
      return response;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to connect to API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Continue to next middleware/page
  return context.next();
}
