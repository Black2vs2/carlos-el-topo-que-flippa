import { Module } from '@nestjs/common';
import { AvalonController } from './avalon.controller';
import { AvalonService } from './avalon.service';
import { AvalonGateway } from './avalon.gateway';
import { AvalonMapService } from './avalon-map.service';

@Module({
  imports: [],
  controllers: [AvalonController],
  providers: [AvalonMapService, AvalonGateway, AvalonService],
  exports: [AvalonService, AvalonMapService],
})
export class AvalonModule {}
