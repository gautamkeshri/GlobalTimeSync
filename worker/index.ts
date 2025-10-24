import { WebSocketServer } from './websocket-server';
import { MemStorage } from './storage';
import { insertTimezoneSchema, insertTeamSchema } from '../shared/schema';

export interface Env {
  WEBSOCKET_SERVER: DurableObjectNamespace;
}

const storage = new MemStorage();

// Helper function to parse JSON body
async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Helper function to get user ID from headers
function getUserId(request: Request): number | null {
  const userId = request.headers.get('user-id');
  return userId ? parseInt(userId) : null;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, user-id',
};

// Handle OPTIONS requests for CORS
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Create response with CORS headers
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const id = env.WEBSOCKET_SERVER.idFromName('default');
      const stub = env.WEBSOCKET_SERVER.get(id);
      return stub.fetch(request);
    }

    try {
      // Authentication routes
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const body = await parseJsonBody(request);
        if (!body) {
          return jsonResponse({ error: 'Invalid request body' }, 400);
        }

        const { firebaseUid, email, displayName, photoURL } = body;
        const user = await storage.createOrUpdateUser({
          firebaseUid,
          email,
          displayName: displayName || null,
          photoURL: photoURL || null,
        });

        return jsonResponse(user);
      }

      if (url.pathname === '/api/auth/guest' && request.method === 'POST') {
        const guestId = `guest_${Date.now()}`;
        const user = await storage.createOrUpdateUser({
          firebaseUid: guestId,
          email: 'guest@example.com',
          displayName: 'Guest User',
          photoURL: null,
        });

        return jsonResponse(user);
      }

      // Timezone routes
      if (url.pathname === '/api/timezones' && request.method === 'GET') {
        const userId = getUserId(request);
        if (!userId) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const timezones = await storage.getUserTimezones(userId);
        return jsonResponse(timezones);
      }

      if (url.pathname === '/api/timezones' && request.method === 'POST') {
        const userId = getUserId(request);
        if (!userId) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const body = await parseJsonBody(request);
        if (!body) {
          return jsonResponse({ error: 'Invalid request body' }, 400);
        }

        const validatedData = insertTimezoneSchema.parse({
          ...body,
          userId,
        });

        const timezone = await storage.createTimezone(validatedData);
        return jsonResponse(timezone);
      }

      if (url.pathname.startsWith('/api/timezones/') && request.method === 'DELETE') {
        const userId = getUserId(request);
        if (!userId) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const id = parseInt(url.pathname.split('/')[3]);
        await storage.deleteTimezone(id, userId);
        return jsonResponse({ success: true });
      }

      if (url.pathname.match(/^\/api\/timezones\/\d+\/primary$/) && request.method === 'PATCH') {
        const userId = getUserId(request);
        if (!userId) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const id = parseInt(url.pathname.split('/')[3]);
        await storage.setPrimaryTimezone(id, userId);
        return jsonResponse({ success: true });
      }

      // Team routes
      if (url.pathname === '/api/teams' && request.method === 'POST') {
        const userId = getUserId(request);
        if (!userId) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const body = await parseJsonBody(request);
        if (!body) {
          return jsonResponse({ error: 'Invalid request body' }, 400);
        }

        const shareId = Math.random().toString(36).substring(2, 15);
        const validatedData = insertTeamSchema.parse({
          ...body,
          ownerId: userId,
          shareId,
        });

        const team = await storage.createTeam(validatedData);
        return jsonResponse(team);
      }

      if (url.pathname.startsWith('/api/teams/shared/') && request.method === 'GET') {
        const shareId = url.pathname.split('/')[4];
        const team = await storage.getTeamByShareId(shareId);

        if (!team) {
          return jsonResponse({ error: 'Team not found' }, 404);
        }

        return jsonResponse(team);
      }

      // Static file serving (for Cloudflare Pages integration)
      // This will be handled by Cloudflare Pages, so we return 404 for unknown routes
      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({
        error: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  },
};

export { WebSocketServer };
