import { WebSocketServer } from './websocket-server';
import serverless from 'serverless-express';
import { app } from '../server';

const handler = serverless(app);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const id = env.WEBSOCKET_SERVER.idFromName('default');
      const stub = env.WEBSOCKET_SERVER.get(id);
      return stub.fetch(request);
    }

    if (url.pathname.startsWith('/api')) {
      return handler(request, env, ctx);
    }

    return new Response('Not found', { status: 404 });
  },
};

export { WebSocketServer };
