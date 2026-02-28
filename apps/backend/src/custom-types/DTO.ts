import { IngestOrderRequest } from './AOData';

export type OrderWithKey = { Key: string; SeededAt: Date } & IngestOrderRequest;
export type ProfitableComparableOrders = { ordersToBuy: OrderWithKey[]; orderToSell: OrderWithKey };
export type ProfitableOrders = { ordersToBuy: OrderWithKey[]; orderToSell: OrderWithKey; Key: string; name: string };
