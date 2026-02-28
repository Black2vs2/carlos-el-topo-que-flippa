import { create } from 'zustand';
import { OrdersStatsPayload } from '../@types/orders-ws.types';

interface OrdersStatsState extends OrdersStatsPayload {
  setStats: (stats: OrdersStatsPayload) => void;
}

export const useOrdersStatsStore = create<OrdersStatsState>()((set) => ({
  connectedClients: 0,
  ingestionsLastMinute: 0,
  ordersIngestedLastMinute: 0,
  ordersByCity: {},
  totalOrdersInDb: 0,
  profitableCount: 0,
  lastIngestionAt: null,
  cacheComputeMs: 0,

  setStats: (stats: OrdersStatsPayload) => set(stats),
}));
