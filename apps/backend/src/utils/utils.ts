import { IngestOrderRequest } from '@custom-types/AOData';
import { OrderWithKey, ProfitableComparableOrders, ProfitableOrders } from '@custom-types/DTO';
import { AuctionTypes } from './config';
import { SimplifiedItem } from '@custom-types/builder.types';
import parsed_items from '../generated/parsed_items.json';
const parsedItems = parsed_items as SimplifiedItem[];

const mapOrder = (order: IngestOrderRequest): OrderWithKey => ({
  ...order,
  // The Go client sends LocationId as a string; convert to number for enum comparisons
  LocationId: Number(order.LocationId) || 0,
  //TODO: understand why some prices are multiplied by 10k
  UnitPriceSilver: order.UnitPriceSilver / 10000,
  Expires: new Date(order.Expires),
  SeededAt: new Date(Date.now()),
  Key: getOrderKey(order),
});

export const mapAndSanitizeOrders = (orders: IngestOrderRequest[]): OrderWithKey[] => orders.map((order) => mapOrder(order));

const itemsBlacklist = ['T1_', 'T2_', 'T3_'];
const itemsWhitelist = ['_CAPE', '_BAG', '_BAG_INSIGHT', '_MAIN_', '_2H_', '_OFF_', '_ARMOR_', '_SHOES_', '_HEAD_'];
export const passesWhitelist = (item: IngestOrderRequest) => {
  const itemTypeId = item.ItemTypeId;

  if (itemsBlacklist.some((itemBlacklist) => itemTypeId.includes(itemBlacklist))) return false;

  return itemsWhitelist.some((itemWhitelist) => itemTypeId.includes(itemWhitelist));
};

const sameItemIsMoreProfitable = (newOrder: IngestOrderRequest, savedOrder: IngestOrderRequest) =>
  savedOrder.AuctionType === AuctionTypes.SELL_ORDER
    ? newOrder.UnitPriceSilver < savedOrder.UnitPriceSilver
    : newOrder.UnitPriceSilver > savedOrder.UnitPriceSilver;
export const dedupeOrdersOfIngest = (orders: IngestOrderRequest[]): OrderWithKey[] => {
  const m = new Map<string, OrderWithKey>();

  for (const order of orders) {
    if (!passesWhitelist(order)) continue;

    const key = getOrderKey(order);
    const existing = m.get(key);

    if (!existing || (existing && sameItemIsMoreProfitable(order, existing))) m.set(key, mapOrder(order));
  }

  return [...m.values()];
};

/**
 * Builds a profitable comparison key from a given key.
 * @param key - The key to build the profitable comparison key from. { key: 'offer.3005.T5_CAPE@2.5' }
 * @returns The profitable comparison key.
 */
export const getProfitableComparisonKey = (order: IngestOrderRequest) => order.ItemTypeId;
// export const buildProfitableComparisonKey = (order:Order) => key.split('.').slice(2, 3).join('.');

const getOrderKey = (order: IngestOrderRequest) => `${order.AuctionType}.${order.LocationId}.${order.ItemTypeId}.${order.QualityLevel}`;

export const mapProfitableComparisonOrdersToObject = (
  profitableComparableOrders: Map<string, ProfitableComparableOrders>
): ProfitableOrders[] => {
  console.log(typeof parsedItems);
  return Array.from(profitableComparableOrders.entries()).map(([key, value]) => ({
    ...value,
    Key: key,
    name: parsedItems.find((i) => i.UniqueName === key)?.LocalizedNames['EN-US'] || '',
  }));
};

// export const removeTierPrefix = (itemName: string): string => {
//   const textsToRemove = ["Novice's ", "Journeyman's ", "Adept's ", "Expert's ", "Master's ", "Grandmaster's ", "Elder's "];

//   const output = textsToRemove.reduce((accumulator, textToRemove) => {
//     return accumulator.replace(textToRemove, '');
//   }, itemName);

//   return output;
// };
