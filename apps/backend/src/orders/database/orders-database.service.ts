import { OrderWithKey } from '@custom-types/DTO';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrdersDatabaseService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<OrderWithKey[]> {
    return (await this.prisma.orders.findMany()) as OrderWithKey[];
  }

  async deleteByCity(cityId: number) {
    return await this.prisma.orders.deleteMany({ where: { LocationId: cityId } });
  }
  async deleteAll() {
    return await this.prisma.orders.deleteMany();
  }

  async saveIngestableOrders(sanitizedOrders: OrderWithKey[]) {
    sanitizedOrders.forEach(async (order) => {
      const foundOrder = await this.prisma.orders.findFirst({ where: { Key: order.Key } }).catch(() => {});

      if (!foundOrder) {
        // put timestamp in brackets
        console.log(`[${new Date().toISOString()}] creating order ${order.Key}`);
        return await this.prisma.orders.create({ data: order }).catch(() => {});
      }

      if (foundOrder.UnitPriceSilver > order.UnitPriceSilver) {
        console.log(`[${new Date().toISOString()}] updating order ${order.Key}`);
        return await this.prisma.orders.update({ where: { Key: order.Key }, data: order }).catch(() => {});
      }

      console.log(`[${new Date().toISOString()}] doing nothing order ${order.Key}`);
    });
  }
}
