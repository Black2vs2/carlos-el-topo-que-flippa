import { IngestOrderRequest, WorldsLocationIdEnum } from '@custom-types/AOData';
import { HttpException, Injectable } from '@nestjs/common';
import { sanitizeForDb } from '@utils/sanitizer';
import { OrdersDatabaseService } from './database/orders-database.service';
import { OrderWithKey, ProfitableComparableOrders, ProfitableOrders } from '@custom-types/DTO';
import { OrdersSeedDatabaseService } from './database/orders-seed-database.service';
import { getProfitableComparisonKey, mapProfitableComparisonOrdersToObject } from '@utils/utils';
import { AuctionTypes } from '@utils/config';

@Injectable()
export class OrdersService {
  constructor(private ordersDatabaseService: OrdersDatabaseService, private ordersSeedDatabaseService: OrdersSeedDatabaseService) {}

  async getAll(): Promise<OrderWithKey[]> {
    return await this.ordersDatabaseService.getAll();
  }

  async seedOrders() {
    return await this.ordersSeedDatabaseService.seedWithOrderJson();
  }
  async seedProfitableOrders() {
    return await this.ordersSeedDatabaseService.seedWithprofitable();
  }

  async getProfitable(): Promise<ProfitableOrders[]> {
    const allOrders = await this.ordersDatabaseService.getAll();

    const blackMarketOrders = [];
    const splittedByKey = new Map<string, OrderWithKey[]>();

    allOrders.forEach((o) => {
      if (o.LocationId === WorldsLocationIdEnum.CarleonBlackMarket) return blackMarketOrders.push(o);
      if (o.AuctionType !== AuctionTypes.SELL_ORDER) return;

      const profitableComparisonKey = getProfitableComparisonKey(o);
      const keyOrders = splittedByKey.get(profitableComparisonKey);

      if (keyOrders) splittedByKey.set(profitableComparisonKey, [...keyOrders, o]);
      else splittedByKey.set(profitableComparisonKey, [o]);
    });

    if (blackMarketOrders.length === 0) return [];

    const profitableOrdersByKey = new Map<string, ProfitableComparableOrders>();
    blackMarketOrders.forEach((orderToSell) => {
      if (orderToSell.AuctionType !== AuctionTypes.BUY_ORDER) return;
      const otherOrdersKey = getProfitableComparisonKey(orderToSell);

      const otherOrders = splittedByKey.get(otherOrdersKey);

      if (!otherOrders) return;

      const profitableOrders = otherOrders.filter(
        (orderToBuy) => orderToBuy.UnitPriceSilver < orderToSell.UnitPriceSilver && orderToBuy.QualityLevel >= orderToSell.QualityLevel
      );

      if (profitableOrders.length !== 0)
        profitableOrdersByKey.set(otherOrdersKey, { ordersToBuy: profitableOrders, orderToSell: orderToSell });
    });

    return mapProfitableComparisonOrdersToObject(profitableOrdersByKey);
  }

  async deleteByCity(cityId: number): Promise<number> {
    let deletedCount: number;

    if (cityId === -1) deletedCount = (await this.ordersDatabaseService.deleteAll())?.count;
    else deletedCount = (await this.ordersDatabaseService.deleteByCity(cityId))?.count;

    return deletedCount;
  }

  async ingestMarketOrders(orders: IngestOrderRequest[]) {
    const sanitizedOrders = sanitizeForDb(orders);

    if (sanitizedOrders.length < 1) throw new HttpException('No sanitized orders to ingest', 402);

    await this.ordersDatabaseService.saveIngestableOrders(sanitizedOrders);
  }
}
