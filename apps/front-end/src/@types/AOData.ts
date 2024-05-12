//Each request from the market is a MarketOrderIngest
export interface MarketOrderIngest {
  Orders: IngestOrderRequest[];
}

export type AuctionType = "offer" | "request";
//Each entry in the market is an Order
export interface IngestOrderRequest {
  Id: number;
  ItemTypeId: string;
  ItemGroupTypeId: string;
  LocationId: number;
  QualityLevel: number;
  EnchantmentLevel: number;
  UnitPriceSilver: number;
  Amount: number;
  AuctionType: AuctionType;
  Expires: Date;
}

export type OrderWithKey = { Key: string; SeededAt: Date } & IngestOrderRequest;
export type ProfitableComparableOrders = { ordersToBuy: OrderWithKey[]; orderToSell: OrderWithKey };
export type ProfitableOrders = { ordersToBuy: OrderWithKey[]; orderToSell: OrderWithKey; Key: string; name: string };
