import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvalonEventRequest {
  @ApiProperty({ enum: ['zone_change', 'chest_event', 'portal_activity'] })
  type: string;

  @ApiPropertyOptional()
  zoneName?: string;

  @ApiPropertyOptional()
  previousZone?: string;

  @ApiPropertyOptional()
  chestId?: string;

  @ApiPropertyOptional()
  chestType?: string;

  @ApiPropertyOptional()
  uniqueName?: string;

  @ApiPropertyOptional()
  locationName?: string;

  @ApiPropertyOptional({
    enum: [
      'Spawned',
      'Opening',
      'Opened',
      'Cancelled',
      'Protected',
      'Unprotected',
      'Despawned',
    ],
  })
  chestStatus?: string;

  @ApiPropertyOptional()
  posX?: number;

  @ApiPropertyOptional()
  posY?: number;

  @ApiPropertyOptional()
  portalId?: string;

  @ApiPropertyOptional()
  portalName?: string;

  @ApiPropertyOptional({ enum: ['entrance', 'exit'] })
  portalType?: string;

  @ApiPropertyOptional()
  playerCount?: number;

  @ApiPropertyOptional()
  timestamp?: string;
}

export class AvalonBatchEventRequest {
  @ApiProperty({ type: [AvalonEventRequest] })
  events: AvalonEventRequest[];
}
