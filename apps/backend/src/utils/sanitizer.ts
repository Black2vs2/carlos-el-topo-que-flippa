import { IngestOrderRequest, WorldsLocationIdEnum } from '@custom-types/AOData';
import { AuctionTypes } from './config';
import { dedupeOrdersOfIngest } from './utils';
import { OrderWithKey } from '@custom-types/DTO';

export const sanitizeForDb = (orders: IngestOrderRequest[]): OrderWithKey[] => {
  const sanitizedOrders = dedupeOrdersOfIngest(orders);

  const idk = sanitizedOrders.filter(
    (order) => !(order.LocationId !== WorldsLocationIdEnum.CarleonBlackMarket && order.AuctionType === AuctionTypes.BUY_ORDER)
  );

  return idk;
};
