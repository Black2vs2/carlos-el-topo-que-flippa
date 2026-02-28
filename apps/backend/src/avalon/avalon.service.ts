import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  AvalonState,
  AvalonEventPayload,
  ZoneHistoryEntry,
  TrackedChest,
  TrackedPortal,
  ChestStatus,
  DecodedMapInfo,
} from '@custom-types/avalon.types';
import { AvalonMapService } from './avalon-map.service';
import { AvalonGateway } from './avalon.gateway';

const MAX_ZONE_HISTORY = 20;
const PORTAL_DECAY_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 30 * 1000; // 30 seconds

@Injectable()
export class AvalonService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AvalonService.name);

  private currentZone: string | null = null;
  private currentMapInfo: DecodedMapInfo | null = null;
  private zoneHistory: ZoneHistoryEntry[] = [];
  private activeChests: TrackedChest[] = [];
  private portals: TrackedPortal[] = [];

  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly mapService: AvalonMapService,
    private readonly gateway: AvalonGateway,
  ) {}

  onModuleInit() {
    this.cleanupInterval = setInterval(() => this.cleanupStalePortals(), CLEANUP_INTERVAL_MS);
    this.logger.log('Avalon service initialized');
  }

  onModuleDestroy() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }

  getState(): AvalonState {
    return {
      currentZone: this.currentZone,
      currentMapInfo: this.currentMapInfo,
      zoneHistory: this.zoneHistory,
      activeChests: this.activeChests,
      portals: this.portals,
    };
  }

  processEvent(event: AvalonEventPayload) {
    switch (event.type) {
      case 'zone_change':
        this.handleZoneChange(event);
        break;
      case 'chest_event':
        this.handleChestEvent(event);
        break;
      case 'portal_activity':
        this.handlePortalActivity(event);
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.type}`);
    }
  }

  private handleZoneChange(event: AvalonEventPayload) {
    const zoneName = event.zoneName;
    if (!zoneName) return;

    const previousZone = event.previousZone || this.currentZone;
    this.logger.log(
      `Zone change: ${previousZone || 'none'} -> ${zoneName}`,
    );

    this.currentZone = zoneName;
    const mapInfo = this.mapService.decodeMapName(zoneName);
    this.currentMapInfo = mapInfo;

    this.logger.log(
      `Map info: tier=${mapInfo.tier} gold=${mapInfo.hasGoldenChest} blue=${mapInfo.hasBlueChest} green=${mapInfo.hasGreenChest} dungeon=${mapInfo.hasDungeon} resources=[${mapInfo.resources.join(',')}]`,
    );

    // Clear chests and portals from previous zone
    this.activeChests = [];
    this.portals = [];

    const entry: ZoneHistoryEntry = {
      zoneName,
      mapInfo,
      timestamp: new Date(),
    };

    this.zoneHistory.unshift(entry);
    if (this.zoneHistory.length > MAX_ZONE_HISTORY) {
      this.zoneHistory = this.zoneHistory.slice(0, MAX_ZONE_HISTORY);
    }

    this.gateway.emitZoneChange(entry);

    if (mapInfo.hasGoldenChest) {
      this.logger.log(`Golden chest zone detected: ${zoneName}`);
      this.gateway.emitGoldenAlert(mapInfo);
    }

    this.gateway.emitFullState(this.getState());
  }

  private handleChestEvent(event: AvalonEventPayload) {
    const { chestId, chestType, chestStatus, uniqueName, locationName, zoneName, posX, posY } = event;
    if (!chestId) return;

    this.logger.log(
      `Chest event: id=${chestId} type=${chestType || '-'} status=${chestStatus || '-'} uniqueName=${uniqueName || '-'} locationName=${locationName || '-'} pos=(${posX ?? '-'},${posY ?? '-'}) zone=${zoneName || '-'}`,
    );

    const existingIndex = this.activeChests.findIndex((c) => c.id === chestId);
    const existing = existingIndex >= 0 ? this.activeChests[existingIndex] : null;

    const chest: TrackedChest = {
      id: chestId,
      zoneName: zoneName || existing?.zoneName || this.currentZone || 'Unknown',
      chestType: chestType || existing?.chestType || 'Unknown',
      uniqueName: uniqueName || existing?.uniqueName || '',
      locationName: locationName || existing?.locationName || '',
      status: (chestStatus as ChestStatus) || existing?.status || 'Spawned',
      posX: posX ?? existing?.posX ?? 0,
      posY: posY ?? existing?.posY ?? 0,
      timestamp: new Date(),
    };

    if (existingIndex >= 0) {
      this.activeChests[existingIndex] = chest;
    } else {
      this.activeChests.push(chest);
    }

    this.gateway.emitChestUpdate(this.activeChests);
    this.gateway.emitFullState(this.getState());
  }

  private handlePortalActivity(event: AvalonEventPayload) {
    const { portalId, zoneName, portalName, portalType, uniqueName, posX, posY, playerCount } = event;
    if (!portalId) return;

    this.logger.log(
      `Portal activity: id=${portalId} name=${portalName || '-'} uniqueName=${uniqueName || '-'} type=${portalType || '-'} pos=(${posX ?? '-'},${posY ?? '-'}) zone=${zoneName || '-'}`,
    );

    const existingIndex = this.portals.findIndex((p) => p.id === portalId);

    const portal: TrackedPortal = {
      id: portalId,
      zoneName: zoneName || this.currentZone || 'Unknown',
      portalName: portalName || '',
      uniqueName: uniqueName || '',
      portalType: (portalType as 'entrance' | 'exit') || 'entrance',
      posX: posX ?? 0,
      posY: posY ?? 0,
      playerCount: playerCount ?? 0,
      lastSeen: new Date(),
    };

    if (existingIndex >= 0) {
      this.portals[existingIndex] = portal;
    } else {
      this.portals.push(portal);
    }

    this.gateway.emitPortalUpdate(this.portals);
    this.gateway.emitFullState(this.getState());
  }

  private cleanupStalePortals() {
    const now = Date.now();
    const before = this.portals.length;

    this.portals = this.portals.filter(
      (p) => now - new Date(p.lastSeen).getTime() < PORTAL_DECAY_MS,
    );

    if (this.portals.length < before) {
      this.logger.debug(`Cleaned up ${before - this.portals.length} stale portals`);
      this.gateway.emitPortalUpdate(this.portals);
    }
  }
}
