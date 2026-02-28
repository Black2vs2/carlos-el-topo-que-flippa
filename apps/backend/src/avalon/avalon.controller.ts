import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvalonService } from './avalon.service';
import { AvalonMapService } from './avalon-map.service';
import { AvalonEventRequest, AvalonBatchEventRequest } from './avalon-dtos';
import { AvalonEventPayload } from '@custom-types/avalon.types';

@ApiTags('Avalon')
@Controller('avalon')
export class AvalonController {
  constructor(
    private readonly avalonService: AvalonService,
    private readonly mapService: AvalonMapService,
  ) {}

  @Post('events')
  @HttpCode(200)
  processEvent(@Body() event: AvalonEventRequest) {
    this.avalonService.processEvent(event as AvalonEventPayload);
    return { status: 'ok' };
  }

  @Post('events/batch')
  @HttpCode(200)
  processBatchEvents(@Body() batch: AvalonBatchEventRequest) {
    for (const event of batch.events) {
      this.avalonService.processEvent(event as AvalonEventPayload);
    }
    return { status: 'ok', processed: batch.events.length };
  }

  @Get('state')
  getState() {
    return this.avalonService.getState();
  }

  @Get('maps')
  getAllMaps() {
    return this.mapService.getAllMaps();
  }

  @Get('maps/:name')
  getMap(@Param('name') name: string) {
    const map = this.mapService.getMapByName(name);
    if (!map) return { error: 'Map not found' };
    return { map, decoded: this.mapService.decodeMapName(name) };
  }
}
