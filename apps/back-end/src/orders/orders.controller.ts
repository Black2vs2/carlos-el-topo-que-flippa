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
  async getAllOrders(): Promise<OrderWithKey[]> {
    return await this.ordersService.getAll();
  }

  @Get('seed/dump')
  async dumpDatabase() {
    const orders = await this.ordersService.getAll();
    const ordersFilePath = join(__dirname, './src/generated/orders.json');
    await writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
  }
  @Get('seed/feed')
  async feedDatabase() {
    await this.ordersService.seedOrders();
  }
  @Get('seed/profitable')
  async seedDatabaseWithProfitable() {
    await this.ordersService.seedProfitableOrders();
    return 'Done';
  }

  @Get('profitable')
  async getProfitable(): Promise<ProfitableOrders[]> {
    return await this.ordersService.getProfitable();
  }

  @Post('marketorders.ingest')
  @HttpCode(200)
  async ingestMarketOrders(@Body() ingestData: MarketOrderIngestRequest): Promise<string> {
    const orders = ingestData.Orders;

    if (!orders || orders.length < 1) throw new HttpException('Malformed request', 400);

    await this.ordersService.ingestMarketOrders(orders);

    return `Successfully ingested orders`;
  }

  @Post('delete-by-city')
  async deleteOrdersByCity(@Body() { cityId, authToken }: DeleteByCityRequest): Promise<string> {
    if (!authToken || authToken !== 'ermaggico') throw new HttpException('Unauthorized', 401);

    const deletedCount = await this.ordersService.deleteByCity(+cityId);

    return `Deleted ${deletedCount} orders`;
  }
}
