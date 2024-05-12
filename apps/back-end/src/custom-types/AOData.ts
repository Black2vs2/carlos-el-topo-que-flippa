//Each request from the market is a MarketOrderIngest
export interface MarketOrderIngest {
  Orders: IngestOrderRequest[];
}

export type AuctionType = 'offer' | 'request';
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

export enum WorldsLocationIdEnum {
  FortSterlingPortal = 4301,
  FortSterlingCity = 4002,
  CarleonCity = 3005,
  CarleonBlackMarket = 3003,
}

export interface ProfitableOrder extends IngestOrderRequest {
  profit: number;
  requestedQuantity: number;
}

export interface SellAndBuyOrderCouples {
  offer: IngestOrderRequest;
  request: IngestOrderRequest;
}

export interface BeautifiedProfitableOrders {
  name: string;
  buy: {
    quality: string;
    where: string;
    price: number;
  };
  sell: {
    quality: string;
    where: string;
    price: number;
  };

  profit: number;
  requestedQuantity: number;
}
