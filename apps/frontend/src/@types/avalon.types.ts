export interface AvalonMapIcon {
  alt: string;
  badge?: number;
}

export interface DecodedMapInfo {
  name: string;
  tier: number;
  hasGoldenChest: boolean;
  hasBlueChest: boolean;
  hasGreenChest: boolean;
  hasDungeon: boolean;
  resources: string[];
  icons: AvalonMapIcon[];
}

export interface ZoneHistoryEntry {
  zoneName: string;
  mapInfo: DecodedMapInfo | null;
  timestamp: string;
}

export type ChestStatus = 'Spawned' | 'Opening' | 'Opened' | 'Cancelled';

export interface TrackedChest {
  id: string;
  zoneName: string;
  chestType: string;
  status: ChestStatus;
  timestamp: string;
}

export interface TrackedPortal {
  id: string;
  zoneName: string;
  playerCount: number;
  lastSeen: string;
}

export interface AvalonState {
  currentZone: string | null;
  zoneHistory: ZoneHistoryEntry[];
  activeChests: TrackedChest[];
  portals: TrackedPortal[];
}

export const AVALON_WS_EVENTS = {
  STATE: 'avalon:state',
  ZONE_CHANGE: 'avalon:zone_change',
  CHEST_UPDATE: 'avalon:chest_update',
  PORTAL_UPDATE: 'avalon:portal_update',
  GOLDEN_ALERT: 'avalon:golden_alert',
} as const;
