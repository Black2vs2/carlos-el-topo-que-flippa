import { IngestOrderRequest, WorldsLocationIdEnum } from '@custom-types/AOData';
import { HttpException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { sanitizeForDb } from '@utils/sanitizer';
import { OrdersDatabaseService } from './database/orders-database.service';
import { OrderWithKey, ProfitableComparableOrders, ProfitableOrders } from '@custom-types/DTO';
import { OrdersSeedDatabaseService } from './database/orders-seed-database.service';
import { getProfitableComparisonKey, mapProfitableComparisonOrdersToObject } from '@utils/utils';
import { AuctionTypes } from '@utils/config';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersService.name);
  private cachedProfitable: ProfitableOrders[] = [];
  private expiryTimer: ReturnType<typeof setInterval>;

  private totalIngestions = 0;
  private totalOrdersIngested = 0;
  private lastIngestionAt: Date | null = null;
  private cacheComputeMs = 0;

  constructor(
    private ordersDatabaseService: OrdersDatabaseService,
    private ordersSeedDatabaseService: OrdersSeedDatabaseService,
    private ordersGateway: OrdersGateway
  ) {}

  onModuleInit() {
    this.ordersDatabaseService.initStatements();
    this.recomputeProfitableCache();

    this.expiryTimer = setInterval(() => {
      const deleted = this.ordersDatabaseService.deleteExpired();
      if (deleted > 0) {
        this.logger.log(`Expired ${deleted} orders`);
        this.recomputeProfitableCache();
      }
    }, 60_000);

    this.logger.log('OrdersService initialized with cache and expiry timer');
  }

  onModuleDestroy() {
    if (this.expiryTimer) {
      clearInterval(this.expiryTimer);
    }
  }

  private recomputeProfitableCache() {
    const start = Date.now();
    this.cachedProfitable = this.computeProfitable();
    this.cacheComputeMs = Date.now() - start;
    this.logger.log(`Cache recomputed: ${this.cachedProfitable.length} profitable groups in ${this.cacheComputeMs}ms`);

    this.ordersGateway.updateClientsWithNewOrders(this.cachedProfitable);
  }

  private computeProfitable(): ProfitableOrders[] {
    const allOrders = this.ordersDatabaseService.getAllNonExpired();

    const blackMarketOrders: OrderWithKey[] = [];
    const splittedByKey = new Map<string, OrderWithKey[]>();

    for (const o of allOrders) {
      if (o.LocationId === WorldsLocationIdEnum.CarleonBlackMarket) {
        blackMarketOrders.push(o);
        continue;
      }
      if (o.AuctionType !== AuctionTypes.SELL_ORDER) continue;

      const profitableComparisonKey = getProfitableComparisonKey(o);
      const existing = splittedByKey.get(profitableComparisonKey);

      if (existing) existing.push(o);
      else splittedByKey.set(profitableComparisonKey, [o]);
    }

    if (blackMarketOrders.length === 0) return [];

    const profitableOrdersByKey = new Map<string, ProfitableComparableOrders>();
    for (const orderToSell of blackMarketOrders) {
      if (orderToSell.AuctionType !== AuctionTypes.BUY_ORDER) continue;
      const otherOrdersKey = getProfitableComparisonKey(orderToSell);
      const otherOrders = splittedByKey.get(otherOrdersKey);

      if (!otherOrders) continue;

      const profitableOrders = otherOrders.filter(
        (orderToBuy) => orderToBuy.UnitPriceSilver < orderToSell.UnitPriceSilver && orderToBuy.QualityLevel >= orderToSell.QualityLevel
      );

      if (profitableOrders.length !== 0)
        profitableOrdersByKey.set(otherOrdersKey, { ordersToBuy: profitableOrders, orderToSell: orderToSell });
    }

    return mapProfitableComparisonOrdersToObject(profitableOrdersByKey);
  }

  getAll(): OrderWithKey[] {
    return this.ordersDatabaseService.getAll();
  }

  seedOrders() {
    this.ordersSeedDatabaseService.seedWithOrderJson();
    this.recomputeProfitableCache();
  }

  seedProfitableOrders() {
    this.ordersSeedDatabaseService.seedWithprofitable();
    this.recomputeProfitableCache();
  }

  getProfitable(): ProfitableOrders[] {
    return this.cachedProfitable;
  }

  deleteByCity(cityId: number): number {
    let deletedCount: number;

    if (cityId === -1) deletedCount = this.ordersDatabaseService.deleteAll();
    else deletedCount = this.ordersDatabaseService.deleteByCity(cityId);

    this.recomputeProfitableCache();
    return deletedCount;
  }

  ingestMarketOrders(orders: IngestOrderRequest[]) {
    const sanitizedOrders = sanitizeForDb(orders);

    if (sanitizedOrders.length < 1) throw new HttpException('No sanitized orders to ingest', 402);

    const result = this.ordersDatabaseService.saveIngestableOrders(sanitizedOrders);

    this.totalIngestions++;
    this.totalOrdersIngested += result.total;
    this.lastIngestionAt = new Date();

    this.recomputeProfitableCache();
  }

  getMetrics() {
    return {
      totalIngestions: this.totalIngestions,
      totalOrdersIngested: this.totalOrdersIngested,
      lastIngestionAt: this.lastIngestionAt,
      cacheComputeMs: this.cacheComputeMs,
      cachedProfitableCount: this.cachedProfitable.length,
      totalOrdersInDb: this.ordersDatabaseService.getOrderCount(),
    };
  }
}
