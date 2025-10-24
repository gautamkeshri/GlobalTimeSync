// Cloudflare Pages Function to route API requests to Worker

export default {
  async fetch(request, env) {
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

      // Forward the request to the Worker
      // Create new request with same method, headers, and body
      const headers = new Headers(request.headers);

      // Clone the request to avoid consuming the body
      const workerRequest = new Request(targetUrl, request);

      try {
        const response = await fetch(workerRequest);
        // Return the response from the Worker
        return response;
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to connect to API' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static assets from Pages
    return env.ASSETS.fetch(request);
  }
};
