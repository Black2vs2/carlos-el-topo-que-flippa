import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersDatabaseService } from './database/orders-database.service';
import { SqliteService } from '../database/sqlite.service';
import { OrdersSeedDatabaseService } from './database/orders-seed-database.service';
import { OrdersGateway } from './orders.gateway';

@Module({
  imports: [],
  controllers: [OrdersController],
  providers: [SqliteService, OrdersDatabaseService, OrdersSeedDatabaseService, OrdersGateway, OrdersService],
  exports: [OrdersService, OrdersDatabaseService, OrdersSeedDatabaseService],
})
export class OrdersModule {}
