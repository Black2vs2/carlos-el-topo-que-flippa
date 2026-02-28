import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AvalonState, AVALON_WS_EVENTS, ZoneHistoryEntry, TrackedChest, TrackedPortal, DecodedMapInfo } from '@custom-types/avalon.types';

@WebSocketGateway({ cors: { origin: '*' } })
export class AvalonGateway {
  @WebSocketServer() server;

  @SubscribeMessage(AVALON_WS_EVENTS.STATE)
  handleStateRequest(@MessageBody() data: string): string {
    return data;
  }

  emitFullState(state: AvalonState) {
    this.server.emit(AVALON_WS_EVENTS.STATE, state);
  }

  emitZoneChange(entry: ZoneHistoryEntry) {
    this.server.emit(AVALON_WS_EVENTS.ZONE_CHANGE, entry);
  }

  emitChestUpdate(chests: TrackedChest[]) {
    this.server.emit(AVALON_WS_EVENTS.CHEST_UPDATE, chests);
  }

  emitPortalUpdate(portals: TrackedPortal[]) {
    this.server.emit(AVALON_WS_EVENTS.PORTAL_UPDATE, portals);
  }

  emitGoldenAlert(mapInfo: DecodedMapInfo) {
    this.server.emit(AVALON_WS_EVENTS.GOLDEN_ALERT, mapInfo);
  }
}
