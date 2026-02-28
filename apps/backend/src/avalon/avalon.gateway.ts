import { Injectable } from '@nestjs/common';
import { WebSocket, WebSocketServer } from 'ws';
import { AvalonState, AVALON_WS_EVENTS, ZoneHistoryEntry, TrackedChest, TrackedPortal, DecodedMapInfo } from '@custom-types/avalon.types';

@Injectable()
export class AvalonGateway {
  private server: WebSocketServer | null = null;

  setServer(wss: WebSocketServer) {
    this.server = wss;
  }

  emitFullState(state: AvalonState) {
    this.broadcast(AVALON_WS_EVENTS.STATE, state);
  }

  emitZoneChange(entry: ZoneHistoryEntry) {
    this.broadcast(AVALON_WS_EVENTS.ZONE_CHANGE, entry);
  }

  emitChestUpdate(chests: TrackedChest[]) {
    this.broadcast(AVALON_WS_EVENTS.CHEST_UPDATE, chests);
  }

  emitPortalUpdate(portals: TrackedPortal[]) {
    this.broadcast(AVALON_WS_EVENTS.PORTAL_UPDATE, portals);
  }

  emitGoldenAlert(mapInfo: DecodedMapInfo) {
    this.broadcast(AVALON_WS_EVENTS.GOLDEN_ALERT, mapInfo);
  }

  private broadcast(event: string, data: unknown) {
    if (!this.server) return;
    const message = JSON.stringify({ event, data });
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
