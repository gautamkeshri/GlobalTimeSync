import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface Client {
  ws: WebSocket;
  userId?: number;
  teamId?: number;
}

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server });
  const clients: Set<Client> = new Set();

  wss.on("connection", (ws: WebSocket) => {
    const client: Client = { ws };
    clients.add(client);

    ws.on("message", (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case "join":
            client.userId = data.userId;
            client.teamId = data.teamId;
            break;
            
          case "timeUpdate":
            // Broadcast time update to all clients in the same team
            broadcastToTeam(client.teamId, {
              type: "timeUpdate",
              time: data.time,
              userId: client.userId,
            });
            break;
            
          case "timezoneUpdate":
            // Broadcast timezone changes to team members
            broadcastToTeam(client.teamId, {
              type: "timezoneUpdate",
              timezone: data.timezone,
              action: data.action, // 'add', 'remove', 'update'
              userId: client.userId,
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(client);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(client);
    });
  });

  function broadcastToTeam(teamId: number | undefined, message: any) {
    if (!teamId) return;
    
    const messageString = JSON.stringify(message);
    
    clients.forEach(client => {
      if (client.teamId === teamId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageString);
      }
    });
  }

  return wss;
}
