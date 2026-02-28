import { ProfitableOrders } from '@custom-types/DTO';
import { ORDERS_WS_EVENTS, OrdersStatsPayload } from '@custom-types/orders-ws.types';
import { Injectable, Logger } from '@nestjs/common';
import { WebSocket, WebSocketServer } from 'ws';

@Injectable()
export class OrdersGateway {
  private readonly logger = new Logger(OrdersGateway.name);
  private server: WebSocketServer | null = null;

  connectedClients = 0;

  private statsProvider: (() => OrdersStatsPayload) | null = null;

  setServer(wss: WebSocketServer) {
    this.server = wss;
  }

  registerStatsProvider(provider: () => OrdersStatsPayload) {
    this.statsProvider = provider;
  }

  handleConnection() {
    this.connectedClients++;
    this.logger.log(`Client connected (total: ${this.connectedClients})`);
    this.broadcastStats();
  }

  handleDisconnect() {
    this.connectedClients--;
    this.logger.log(`Client disconnected (total: ${this.connectedClients})`);
    this.broadcastStats();
  }

  emitProfitableOrders(orders: ProfitableOrders[]) {
    this.broadcast(ORDERS_WS_EVENTS.PROFITABLE_ORDERS, orders);
  }

  broadcastStats() {
    if (!this.statsProvider) return;
    const stats = this.statsProvider();
    this.broadcast(ORDERS_WS_EVENTS.STATS, stats);
  }

  private broadcast(event: string, data: unknown) {
    if (!this.server) return;
    const message = JSON.stringify({ event, data });
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
