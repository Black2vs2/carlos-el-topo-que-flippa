import { Body, Controller, Get, HttpCode, HttpException, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderWithKey, ProfitableOrders } from '@custom-types/DTO';
import { DeleteByCityRequest, MarketOrderIngestRequest } from './orders-dtos';
import { ApiTags } from '@nestjs/swagger';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('')
  getAllOrders(): OrderWithKey[] {
    return this.ordersService.getAll();
  }

  @Get('seed/dump')
  async dumpDatabase() {
    const orders = this.ordersService.getAll();
    const ordersFilePath = join(__dirname, './src/generated/orders.json');
    await writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
  }

  @Get('seed/feed')
  feedDatabase() {
    this.ordersService.seedOrders();
  }

  @Get('seed/profitable')
  seedDatabaseWithProfitable() {
    this.ordersService.seedProfitableOrders();
    return 'Done';
  }

  @Get('profitable')
  getProfitable(): ProfitableOrders[] {
    return this.ordersService.getProfitable();
  }

  @Get('metrics')
  getMetrics() {
    return this.ordersService.getMetrics();
  }

  @Post('marketorders.ingest')
  @HttpCode(200)
  ingestMarketOrders(@Body() ingestData: MarketOrderIngestRequest): string {
    const orders = ingestData.Orders;

    if (!orders || orders.length < 1) throw new HttpException('Malformed request', 400);

    this.ordersService.ingestMarketOrders(orders);

    return `Successfully ingested orders`;
  }

  @Post('delete-by-city')
  deleteOrdersByCity(@Body() { cityId, authToken }: DeleteByCityRequest): string {
    if (!authToken || authToken !== 'ermaggico') throw new HttpException('Unauthorized', 401);

    const deletedCount = this.ordersService.deleteByCity(+cityId);

    return `Deleted ${deletedCount} orders`;
  }
}
