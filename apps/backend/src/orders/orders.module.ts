import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersDatabaseService } from './database/orders-database.service';
import { PrismaService } from '../database/prisma.service';
import { OrdersSeedDatabaseService } from './database/orders-seed-database.service';
import { OrdersGateway } from './orders.gateway';

@Module({
  imports: [],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersDatabaseService, OrdersSeedDatabaseService, OrdersGateway, PrismaService],
  exports: [OrdersService, OrdersDatabaseService, OrdersSeedDatabaseService],
})
export class OrdersModule {}
