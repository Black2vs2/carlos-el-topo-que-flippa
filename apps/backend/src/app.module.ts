import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { AvalonModule } from './avalon/avalon.module';

@Module({
  imports: [OrdersModule, AvalonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
