import { QueryClient } from '@tanstack/react-query';
import { socket } from './socket';
import { ORDERS_WS_EVENTS, OrdersStatsPayload } from '../@types/orders-ws.types';
import { ProfitableOrders } from '../@types/AOData';
import { useOrdersStatsStore } from '../_stores/useOrdersStatsStore';

export function setupOrdersSocketListeners(queryClient: QueryClient) {
  socket.on(ORDERS_WS_EVENTS.PROFITABLE_ORDERS, (orders: ProfitableOrders[]) => {
    queryClient.setQueryData(['orders'], orders);
  });

  socket.on(ORDERS_WS_EVENTS.STATS, (stats: OrdersStatsPayload) => {
    useOrdersStatsStore.getState().setStats(stats);
  });
}

export function cleanupOrdersSocketListeners() {
  socket.off(ORDERS_WS_EVENTS.PROFITABLE_ORDERS);
  socket.off(ORDERS_WS_EVENTS.STATS);
}
