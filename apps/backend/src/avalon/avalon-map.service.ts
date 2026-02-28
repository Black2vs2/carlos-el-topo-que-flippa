import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AvalonMapEntry, DecodedMapInfo } from '@custom-types/avalon.types';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AvalonMapService implements OnModuleInit {
  private readonly logger = new Logger(AvalonMapService.name);
  private maps = new Map<string, AvalonMapEntry>();

  onModuleInit() {
    this.loadMaps();
  }

  private loadMaps() {
    try {
      const dataPath = join(__dirname, 'assets', 'data.json');
      const raw = readFileSync(dataPath, 'utf-8');
      const entries: AvalonMapEntry[] = JSON.parse(raw);

      for (const entry of entries) {
        this.maps.set(entry.name.toLowerCase(), entry);
      }

      this.logger.log(`Loaded ${this.maps.size} Avalon maps`);
    } catch (err) {
      this.logger.error('Failed to load data.json', err);
    }
  }

  getMapByName(name: string): AvalonMapEntry | undefined {
    return this.maps.get(name.toLowerCase());
  }

  getAllMaps(): AvalonMapEntry[] {
    return Array.from(this.maps.values());
  }

  isGoldenChestMap(name: string): boolean {
    const entry = this.getMapByName(name);
    if (!entry) return false;
    return entry.icons.some((icon) => icon.alt === 'GOLD');
  }

  decodeMapName(name: string): DecodedMapInfo {
    const entry = this.getMapByName(name);
    const icons = entry?.icons ?? [];

    const resources = icons
      .filter((i) => !['BLUE', 'GREEN', 'GOLD', 'DUNGEON'].includes(i.alt))
      .map((i) => i.alt);

    return {
      name,
      tier: entry?.tier ?? 0,
      hasGoldenChest: icons.some((i) => i.alt === 'GOLD'),
      hasBlueChest: icons.some((i) => i.alt === 'BLUE'),
      hasGreenChest: icons.some((i) => i.alt === 'GREEN'),
      hasDungeon: icons.some((i) => i.alt === 'DUNGEON'),
      resources,
      icons,
    };
  }
}
