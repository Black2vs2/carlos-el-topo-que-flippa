export interface AvalonMapIcon {
  alt: string;
  badge?: number;
}

export interface AvalonMapEntry {
  name: string;
  tier: number;
  icons: AvalonMapIcon[];
  img: string;
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
  timestamp: Date;
}

export type ChestStatus =
  | 'Spawned'
  | 'Opening'
  | 'Opened'
  | 'Cancelled'
  | 'Protected'
  | 'Unprotected'
  | 'Despawned';

export interface TrackedChest {
  id: string;
  zoneName: string;
  chestType: string;
  uniqueName: string;
  locationName: string;
  status: ChestStatus;
  posX: number;
  posY: number;
  timestamp: Date;
}

export interface TrackedPortal {
  id: string;
  zoneName: string;
  portalName: string;
  uniqueName: string;
  portalType: 'entrance' | 'exit';
  posX: number;
  posY: number;
  playerCount: number;
  lastSeen: Date;
}

export interface AvalonState {
  currentZone: string | null;
  currentMapInfo: DecodedMapInfo | null;
  zoneHistory: ZoneHistoryEntry[];
  activeChests: TrackedChest[];
  portals: TrackedPortal[];
}

export type AvalonEventType = 'zone_change' | 'chest_event' | 'portal_activity';

export interface AvalonEventPayload {
  type: AvalonEventType;
  zoneName?: string;
  previousZone?: string;
  chestId?: string;
  chestType?: string;
  uniqueName?: string;
  locationName?: string;
  chestStatus?: ChestStatus;
  posX?: number;
  posY?: number;
  portalId?: string;
  portalName?: string;
  portalType?: 'entrance' | 'exit';
  playerCount?: number;
  timestamp?: string;
}

export const AVALON_WS_EVENTS = {
  STATE: 'avalon:state',
  ZONE_CHANGE: 'avalon:zone_change',
  CHEST_UPDATE: 'avalon:chest_update',
  PORTAL_UPDATE: 'avalon:portal_update',
  GOLDEN_ALERT: 'avalon:golden_alert',
} as const;
