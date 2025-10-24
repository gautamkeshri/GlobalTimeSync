interface Client {
  socket: WebSocket;
  userId?: number;
  teamId?: number;
}

export class WebSocketServer {
  state: DurableObjectState;
  clients: Set<Client>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.clients = new Set();
  }

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());

    const clientInfo: Client = { socket: server };
    this.clients.add(clientInfo);

    server.accept();

    server.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data as string);

        switch (data.type) {
          case 'join':
            clientInfo.userId = data.userId;
            clientInfo.teamId = data.teamId;
            break;

          case 'timeUpdate':
            // Broadcast time update to all clients in the same team
            this.broadcastToTeam(clientInfo.teamId, {
              type: 'timeUpdate',
              time: data.time,
              userId: clientInfo.userId,
            }, clientInfo);
            break;

          case 'timezoneUpdate':
            // Broadcast timezone changes to team members
            this.broadcastToTeam(clientInfo.teamId, {
              type: 'timezoneUpdate',
              timezone: data.timezone,
              action: data.action, // 'add', 'remove', 'update'
              userId: clientInfo.userId,
            }, clientInfo);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    server.addEventListener('close', () => {
      this.clients.delete(clientInfo);
    });

    server.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      this.clients.delete(clientInfo);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private broadcastToTeam(teamId: number | undefined, message: any, sender: Client) {
    if (!teamId) return;

    const messageString = JSON.stringify(message);

    this.clients.forEach((client) => {
      // Don't send back to sender, and only send to clients in the same team
      if (client !== sender && client.teamId === teamId) {
        try {
          client.socket.send(messageString);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    });
  }
}
