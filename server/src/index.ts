import { Client, Room, Server } from "colyseus";
import express from "express";
import { createServer } from "http";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3000;

const gameServer: Server = new Server({
  server: createServer(app),
});

class ChatRoom extends Room {
  // maximum number of clients per active session
  maxClients = 4;

  onInit(): void {
    this.setState({ messages: [] });
  }
  onJoin(client: Client): void {
    this.state.messages.push(`${client.sessionId} joined.`);
  }
  onMessage(client: Client, data: any): void {
    this.state.messages.push(data);
  }
}

// register ChatRoom as "chat"
gameServer.register("chat", ChatRoom);
gameServer.listen(port);
