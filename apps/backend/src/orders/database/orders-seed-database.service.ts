import { IngestOrderRequest } from '@custom-types/AOData';
import { Injectable, Logger } from '@nestjs/common';
import { seedOrders } from './orders';
import { sanitizeForDb } from '@utils/sanitizer';
import { OrderWithKey } from '@custom-types/DTO';
import { OrdersDatabaseService } from './orders-database.service';
import * as orders from '../../generated/orders.json';
const parsedOrders = orders as unknown as OrderWithKey[];

@Injectable()
export class OrdersSeedDatabaseService {
  private readonly logger = new Logger(OrdersSeedDatabaseService.name);

  constructor(private ordersDatabaseService: OrdersDatabaseService) {}

  seedWithOrderJson() {
    this.logger.log(`Seeding ${parsedOrders.length} orders from JSON`);
    return this.ordersDatabaseService.saveIngestableOrders(parsedOrders);
  }

  seedWithprofitable() {
    const sanitizedBlackmarketOrders = sanitizeForDb(seedOrders.profitable.blackMarketOrders as unknown as IngestOrderRequest[]);
    const sanitizedCityOrders = sanitizeForDb(seedOrders.profitable.cityOrders as unknown as IngestOrderRequest[]);
    const allOrders = [...sanitizedBlackmarketOrders, ...sanitizedCityOrders];

    this.logger.log(`Seeding ${allOrders.length} profitable orders (${sanitizedBlackmarketOrders.length} black market + ${sanitizedCityOrders.length} city)`);
    return this.ordersDatabaseService.saveIngestableOrders(allOrders);
  }
}
