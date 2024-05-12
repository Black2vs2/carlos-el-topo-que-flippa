import { IngestOrderRequest } from '@custom-types/AOData';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { seedOrders } from './orders';
import { sanitizeForDb } from '@utils/sanitizer';
import { OrderWithKey } from '@custom-types/DTO';
import * as orders from '../../generated/orders.json';
const parsedOrders = orders as unknown as OrderWithKey[];
@Injectable()
export class OrdersSeedDatabaseService {
  constructor(private prisma: PrismaService) {}

  async seedWithOrderJson() {
    await this.prisma.orders.createMany({ data: parsedOrders as unknown as OrderWithKey[] });
  }

  async seedWithprofitable() {
    const sanitizedBlackmarketOrders = sanitizeForDb(seedOrders.profitable.blackMarketOrders as unknown as IngestOrderRequest[]);
    sanitizedBlackmarketOrders.forEach(async (order) => {
      await this.prisma.orders.create({ data: order });
    });
    const sanitizedCityOrders = sanitizeForDb(seedOrders.profitable.cityOrders as unknown as IngestOrderRequest[]);
    sanitizedCityOrders.forEach(async (order) => {
      await this.prisma.orders.create({ data: order });
    });
  }
}
