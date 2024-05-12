import { ProfitableOrders } from '@custom-types/DTO';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway {
  @WebSocketServer() server;

  @SubscribeMessage('orders')
  handleEvent(@MessageBody() data: string): string {
    this.server.emit('orders', 'responseFromServer');
    return data;
  }

  updateClientsWithNewOrders(orders: ProfitableOrders[]) {
    this.server.emit('orders', orders);
  }
}
