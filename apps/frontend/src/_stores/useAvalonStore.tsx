import { create } from 'zustand';
import { AvalonState, ZoneHistoryEntry, TrackedChest, TrackedPortal, DecodedMapInfo } from '../@types/avalon.types';

interface AvalonStoreState extends AvalonState {
  goldenAlert: DecodedMapInfo | null;
  setFullState: (state: AvalonState) => void;
  setCurrentZone: (entry: ZoneHistoryEntry) => void;
  updateChests: (chests: TrackedChest[]) => void;
  updatePortals: (portals: TrackedPortal[]) => void;
  setGoldenAlert: (mapInfo: DecodedMapInfo | null) => void;
}

export const useAvalonStore = create<AvalonStoreState>()((set) => ({
  currentZone: null,
  zoneHistory: [],
  activeChests: [],
  portals: [],
  goldenAlert: null,

  setFullState: (state: AvalonState) =>
    set({
      currentZone: state.currentZone,
      zoneHistory: state.zoneHistory,
      activeChests: state.activeChests,
      portals: state.portals,
    }),

  setCurrentZone: (entry: ZoneHistoryEntry) =>
    set((prev) => ({
      currentZone: entry.zoneName,
      zoneHistory: [entry, ...prev.zoneHistory].slice(0, 20),
    })),

  updateChests: (chests: TrackedChest[]) => set({ activeChests: chests }),

  updatePortals: (portals: TrackedPortal[]) => set({ portals }),

  setGoldenAlert: (mapInfo: DecodedMapInfo | null) => set({ goldenAlert: mapInfo }),
}));
