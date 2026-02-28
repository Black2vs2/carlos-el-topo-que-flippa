import { socket } from './socket';
import { AVALON_WS_EVENTS, AvalonState, ZoneHistoryEntry, TrackedChest, TrackedPortal, DecodedMapInfo } from '../@types/avalon.types';
import { useAvalonStore } from '../_stores/useAvalonStore';

export function setupAvalonSocketListeners() {
  const store = useAvalonStore.getState();

  socket.on(AVALON_WS_EVENTS.STATE, (state: AvalonState) => {
    useAvalonStore.getState().setFullState(state);
  });

  socket.on(AVALON_WS_EVENTS.ZONE_CHANGE, (entry: ZoneHistoryEntry) => {
    useAvalonStore.getState().setCurrentZone(entry);
  });

  socket.on(AVALON_WS_EVENTS.CHEST_UPDATE, (chests: TrackedChest[]) => {
    useAvalonStore.getState().updateChests(chests);
  });

  socket.on(AVALON_WS_EVENTS.PORTAL_UPDATE, (portals: TrackedPortal[]) => {
    useAvalonStore.getState().updatePortals(portals);
  });

  socket.on(AVALON_WS_EVENTS.GOLDEN_ALERT, (mapInfo: DecodedMapInfo) => {
    useAvalonStore.getState().setGoldenAlert(mapInfo);
  });
}

export function cleanupAvalonSocketListeners() {
  socket.off(AVALON_WS_EVENTS.STATE);
  socket.off(AVALON_WS_EVENTS.ZONE_CHANGE);
  socket.off(AVALON_WS_EVENTS.CHEST_UPDATE);
  socket.off(AVALON_WS_EVENTS.PORTAL_UPDATE);
  socket.off(AVALON_WS_EVENTS.GOLDEN_ALERT);
}
