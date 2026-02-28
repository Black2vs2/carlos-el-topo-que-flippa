import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  AvalonState,
  AvalonEventPayload,
  ZoneHistoryEntry,
  TrackedChest,
  TrackedPortal,
  ChestStatus,
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

    this.currentZone = zoneName;
    const mapInfo = this.mapService.decodeMapName(zoneName);

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
    const { chestId, chestType, chestStatus, zoneName } = event;
    if (!chestId) return;

    const existingIndex = this.activeChests.findIndex((c) => c.id === chestId);

    const chest: TrackedChest = {
      id: chestId,
      zoneName: zoneName || this.currentZone || 'Unknown',
      chestType: chestType || 'Unknown',
      status: (chestStatus as ChestStatus) || 'Spawned',
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
    const { portalId, zoneName, playerCount } = event;
    if (!portalId) return;

    const existingIndex = this.portals.findIndex((p) => p.id === portalId);

    const portal: TrackedPortal = {
      id: portalId,
      zoneName: zoneName || this.currentZone || 'Unknown',
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
