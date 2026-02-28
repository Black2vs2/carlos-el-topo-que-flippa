import { ProfitableOrders } from '@custom-types/DTO';
import { ORDERS_WS_EVENTS, OrdersStatsPayload } from '@custom-types/orders-ws.types';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer() server: Server;

  connectedClients = 0;

  private statsProvider: (() => OrdersStatsPayload) | null = null;

  registerStatsProvider(provider: () => OrdersStatsPayload) {
    this.statsProvider = provider;
  }

  handleConnection(_client: Socket) {
    this.connectedClients++;
    this.logger.log(`Client connected (total: ${this.connectedClients})`);
    this.broadcastStats();
  }

  handleDisconnect(_client: Socket) {
    this.connectedClients--;
    this.logger.log(`Client disconnected (total: ${this.connectedClients})`);
    this.broadcastStats();
  }

  emitProfitableOrders(orders: ProfitableOrders[]) {
    this.server.emit(ORDERS_WS_EVENTS.PROFITABLE_ORDERS, orders);
  }

  broadcastStats() {
    if (!this.statsProvider) return;
    const stats = this.statsProvider();
    this.server.emit(ORDERS_WS_EVENTS.STATS, stats);
  }
}
