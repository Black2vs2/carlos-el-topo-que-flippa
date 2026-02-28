import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvalonEventRequest {
  @ApiProperty({ enum: ['zone_change', 'chest_event', 'portal_activity'] })
  type: string;

  @ApiPropertyOptional()
  zoneName?: string;

  @ApiPropertyOptional()
  chestId?: string;

  @ApiPropertyOptional()
  chestType?: string;

  @ApiPropertyOptional({ enum: ['Spawned', 'Opening', 'Opened', 'Cancelled'] })
  chestStatus?: string;

  @ApiPropertyOptional()
  portalId?: string;

  @ApiPropertyOptional()
  playerCount?: number;

  @ApiPropertyOptional()
  timestamp?: string;
}

export class AvalonBatchEventRequest {
  @ApiProperty({ type: [AvalonEventRequest] })
  events: AvalonEventRequest[];
}
