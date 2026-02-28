export const ORDERS_WS_EVENTS = {
  PROFITABLE_ORDERS: 'orders:profitable',
  STATS: 'orders:stats',
} as const;

export interface OrdersStatsPayload {
  connectedClients: number;
  ingestionsLastMinute: number;
  ordersIngestedLastMinute: number;
  ordersByCity: Record<number, number>;
  totalOrdersInDb: number;
  profitableCount: number;
  lastIngestionAt: string | null;
  cacheComputeMs: number;
}
