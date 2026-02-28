# Albion Online - Avalon Roads Map Naming Convention & Data Analysis

## 1. Map Name Structure

Avalon road zone names follow the pattern: **`FirstWord-SecondWord`** (e.g., `Filites-Izohun`)

### First Word = Map Shape + Tier Indicator

The **first letter** of the first word encodes the **physical shape of the road layout**:

| First Letter | Road Shape | Map Count |
| ------------ | --------------- | --------- |
| **C**        | C-shape         | 48        |
| **F**        | F-shape         | 47        |
| **H**        | H-shape         | 41        |
| **O**        | O-shape (loop)  | 25        |
| **P**        | P-shape         | 26        |
| **S**        | S-shape         | 65        |
| **T**        | T-shape         | 22        |
| **X**        | X-shape (cross) | 21        |

**Special prefixes** for **Avalonian Rest zones** (hideout placement allowed):

| Prefix   | Latin Number    | Tier |
| -------- | --------------- | ---- |
| **Qii-** | Quinque (5?)    | T6   |
| **Qua-** | Quater (4?)     | T6   |
| **Sec-** | Secundus (2?)   | T6   |
| **Set-** | Septimus (7?)   | T6   |

Rest maps have a 3-part naming with connectors: `Secent-Al-Duosom`, `Qiient-Et-Nusas`

### Rest Map Prefix Variants

| Prefix     | Count | Notes              |
| ---------- | ----- | ------------------ |
| **Qiient** | 16    | Rest map variant   |
| **Qiitun** | 3     | Rest map variant   |
| **Quaent** | 7     | Rest map variant   |
| **Quatun** | 3     | Rest map variant   |
| **Secent** | 10    | Rest map variant   |
| **Sectun** | 4     | Rest map variant   |
| **Setent** | 8     | Rest map variant   |
| **Settun** | 5     | Rest map variant   |

Connectors used: `Al`, `Et`, `In`, `Si`, `Qi`, `Sa`, `Oc`

---

## 2. Second Word Suffix = Guaranteed Spawn Content

The **last 2-3 characters** of the second word reveal what **large resource or chest** spawns at least once.

### Chest Suffixes

| Suffix   | Meaning                          | Example            |
| -------- | -------------------------------- | ------------------ |
| **-un**  | Large **Golden Chest** (best)    | Filites-Izoh**un** |
| **-am**  | Large **Blue Chest**             | Cilitos-Opod**am** |
| **-los** | Large **Green Chest**            | Cases-Ugum**los**  |

### Resource Suffixes

| Suffix   | Meaning                          | Resource |
| -------- | -------------------------------- | -------- |
| **-lum** | Large **Ore** node               | Ore      |
| **-aum** | Large **Wood** node              | Wood     |
| **-tum** | Large **Hide/Leather** node      | Hide     |
| **-sum** | Large **Fiber/Cotton** node      | Fiber    |
| **-rom** | Large **Stone/Rock** node        | Stone    |

### Suffix Distribution (322 maps total)

| Suffix         | Count | %     |
| -------------- | ----- | ----- |
| `-tum` (hide)  | 49    | 15.2% |
| `-sum` (fiber) | 44    | 13.7% |
| `-rom` (stone) | 40    | 12.4% |
| `-los` (green) | 37    | 11.5% |
| `-lum` (ore)   | 35    | 10.9% |
| `-am` (blue)   | 35    | 10.9% |
| `-aum` (wood)  | 30    | 9.3%  |
| `-un` (golden) | 12    | 3.7%  |
| other          | ~40   | 12.4% |

Golden chests (`-un`) are the **rarest** — only 12 out of 322 maps.

---

## 3. Icon Types (from data.json)

Each map entry has icons with optional `badge` counts indicating quantity.

| Icon     | Meaning                     |
| -------- | --------------------------- |
| `GOLD`   | Golden chest(s)             |
| `BLUE`   | Blue chest(s)               |
| `GREEN`  | Green chest(s)              |
| `DUNGEON`| Dungeon entrance(s)         |
| `ORE`    | Ore gathering node(s)       |
| `LOGS`   | Wood gathering node(s)      |
| `ROCK`   | Stone gathering node(s)     |
| `COTTON` | Fiber gathering node(s)     |
| `HIRE`   | Mercenary/hire location(s)  |
| `HIDE`   | Hide gathering node (rare)  |

Example: `{ "alt": "GREEN", "badge": 8 }` = 8 green chests on that map.

---

## 4. Tier Distribution

| Tier   | Count | %     |
| ------ | ----- | ----- |
| **T4** | 88    | 27.3% |
| **T6** | 207   | 64.3% |
| **T8** | 27    | 8.4%  |

Key patterns:

- **Rest/hideout maps** are always T6, never have GOLD or DUNGEON
- **F-shape maps** have the most T8 maps (12 out of 47)
- **O and X shape maps** never appear at T8
- **C-shape maps** are heavily weighted toward T4 (52%)

### First Letter vs Tier Breakdown

| Letter | Total | T4 | T6 | T8 | Has GOLD | Has DUNGEON |
| ------ | ----- | -- | -- | -- | -------- | ----------- |
| **C**  | 48    | 25 | 21 | 2  | 11       | 31          |
| **F**  | 47    | 12 | 23 | 12 | 17       | 31          |
| **H**  | 41    | 6  | 30 | 5  | 13       | 32          |
| **O**  | 25    | 11 | 14 | 0  | 13       | 21          |
| **P**  | 26    | 12 | 14 | 0  | 10       | 18          |
| **Q**  | 27    | 0  | 27 | 0  | 0        | 0           |
| **S**  | 65    | 10 | 50 | 5  | 18       | 23          |
| **T**  | 22    | 7  | 12 | 3  | 9        | 12          |
| **X**  | 21    | 5  | 16 | 0  | 8        | 18          |

---

## 5. Game Data: Cluster Files

From `Albion-Online_Data\StreamingAssets\GameData\cluster\`:

**1,196 cluster files** with naming pattern:

```
[ID]_[TYPE]_[SUBTYPE]_[MODE]_[TIER]_[FACTION]_[ZONE].cluster.bin
```

### Avalon Road Clusters (TNL = Tunnel)

- **TNL-001 through TNL-200** — 200 Avalon road cluster files
- Pattern: `TNL-###_RDS_RO_AUTO_T#_AVA_AVA.cluster.bin`
- All use `RDS` (Roads) type, `AVA` faction, `AVA` zone

### Cluster Type Codes

| Code  | Meaning              |
| ----- | -------------------- |
| `WRL` | World (open world)   |
| `DNG` | Dungeon              |
| `CTY` | City                 |
| `STT` | Settlement           |
| `HBS` | Hideout              |
| `EXP` | Expedition           |
| `RDS` | Roads (Avalon roads) |

### Faction Codes

| Code  | Faction  |
| ----- | -------- |
| `KPR` | Keeper   |
| `HER` | Heretic  |
| `UND` | Undead   |
| `MOR` | Morgana  |
| `AVA` | Avalon   |

### Zone Codes

| Code    | Zone             |
| ------- | ---------------- |
| `ROY`   | Royal Continent  |
| `OUT`   | Outlands         |
| `AVA`   | Avalon           |
| `Q1-Q6` | Quarters         |

### Other Notable Cluster Types

| Pattern            | Count | Description               |
| ------------------ | ----- | ------------------------- |
| `CORRUPT-*`        | 20    | Corrupted dungeons        |
| `HELLGATE-*`       | 10+   | Hellgates (2v2/5v5/10v10) |
| `DNG-HER-*`        | Many  | Heretic dungeons          |
| `DNG-KPR-*`        | Many  | Keeper dungeons           |
| `DNG-MOR-*`        | Many  | Morgana dungeons          |
| `DNG-UND-*`        | Many  | Undead dungeons           |
| `AVALON-LIONEL-*`  | 2     | Avalon dungeon instances  |
| `HIDEOUT-*`        | 3     | Hideout templates         |
| `ISLAND-*`         | Many  | Player/guild islands      |

---

## 6. Key Binary Data Files

Located in `Albion-Online_Data\StreamingAssets\GameData\`:

| File                             | Size   | Content                       |
| -------------------------------- | ------ | ----------------------------- |
| `lootchests.bin`                 | 41 KB  | Loot chest definitions        |
| `loot.bin`                       | 110 KB | Loot table definitions        |
| `treasuredistribution.bin`       | 24 KB  | Treasure spawn distribution   |
| `treasuredistribution_asia.bin`  | 24 KB  | Asia region distribution      |
| `treasuredistribution_europe.bin`| 24 KB  | Europe region distribution    |
| `treasures.bin`                  | 1.2 KB | Treasure object definitions   |
| `outlandsteleportationportals.bin`| 1.3 KB| Outland portal definitions   |
| `randomdungeons.bin`             | 17 KB  | Random dungeon generation     |
| `dynamicclusters.bin`            | 14 KB  | Dynamic cluster data          |
| `mists.bin`                      | 9.2 KB | Mists content                 |
| `worldsettings.bin`              | 17 KB  | Global world configuration    |
| `worldbosses.bin`                | 784 B  | World boss spawn locations    |
| `mobs.bin`                       | 547 KB | Monster definitions           |
| `items.bin`                      | 382 KB | Item definitions              |

All binary files are serialized (likely protobuf or custom format) and require a custom deserializer.

---

## 7. Network Events (albiondata-client)

The Photon protocol client captures these relevant events:

### Chest Events

| Event Code | Name                                         | Description                    |
| ---------- | -------------------------------------------- | ------------------------------ |
| 126        | `evNewTreasureChest`                         | New chest spawned              |
| 285        | `evTreasureChestUsingStart`                  | Player starts opening          |
| 286        | `evTreasureChestUsingFinished`               | Chest opened successfully      |
| 287        | `evTreasureChestUsingCancel`                 | Opening cancelled              |
| 288        | `evTreasureChestUsingOpeningComplete`        | Opening sequence complete      |
| 289        | `evTreasureChestForceCloseInventory`         | Force close (inventory full)   |
| 290        | `evLocalTreasuresUpdate`                     | Treasures in current zone      |
| 291        | `evLootChestSpawnpointsUpdate`               | Spawn point updates            |
| 398        | `evNewLootChest`                             | Generic loot chest             |
| 399        | `evUpdateLootChest`                          | Chest state updates            |
| 400        | `evLootChestOpened`                          | Chest opened                   |
| 401        | `evUpdateLootProtectedByMobsWithMinimapDisplay` | Guarded chest update        |

### Portal Events

| Event Code | Name                                  | Description                |
| ---------- | ------------------------------------- | -------------------------- |
| 328        | `evNewPortalEntrance`                 | Portal entrance spawned    |
| 329        | `evNewPortalExit`                     | Portal exit spawned        |
| 330        | `evNewRandomDungeonExit`              | Random dungeon exit        |
| 527        | `evNewMistsStaticEntrance`            | Mists dungeon entrance     |
| 528        | `evNewMistsOpenWorldExit`             | Mists open world exit      |
| 532        | `evNewMistsCityEntrance`              | Mists city entrance        |
| 533        | `evNewMistsCityRoadsEntrance`         | Avalon roads entrance      |
| 609        | `evNewOutlandsTeleportationPortal`    | Outlands teleport portal   |
| 610        | `evNewOutlandsTeleportationReturnPortal` | Outlands return portal  |
| 636        | `evNewHellDungeonUpwardExit`          | Hell dungeon upward exit   |
| 638        | `evNewHellDungeonDownwardExit`        | Hell dungeon downward exit |
| 639        | `evNewHellDungeonChestExit`           | Hell dungeon chest exit    |
| 641        | `evNewHellDungeonStaticEntrance`      | Hell dungeon entrance      |
| 665        | `evNewFactionWarfarePortal`           | Faction warfare portal     |

### Avalon / Red Zone Events

| Event Code | Name                                  | Description                |
| ---------- | ------------------------------------- | -------------------------- |
| 484        | `evRedZoneWorldMapEvent`              | Avalon bandit event        |
| 481        | `evRedZonePlayerNotification`         | Player notification        |
| 483        | `evRedZoneFortressEventChestOpened`   | Fortress chest opened      |
| 673        | `evRedZoneEventStandings`             | Event standings/rankings   |

Province identifiers: `DUCHY_RED_01`, `DUCHY_RED_05`, etc.

### Key Operations

| Op Code | Name                          | Description                      |
| ------- | ----------------------------- | -------------------------------- |
| 211     | `opGetClusterMapInfo`         | Get full cluster/zone map info   |
| 36      | `opGetGameServerByCluster`    | Determine server for a cluster   |
| 312     | `evUsePortalEntrance`         | Player uses portal               |

---

## 8. Map Data Structure (from albiondata-client)

```go
type MapDataUpload struct {
    ZoneID          int      // Zone/Cluster ID
    BuildingType    []int    // Building types at coordinates
    AvailableFood   []int    // Food resources available
    Reward          []int    // Reward values
    AvailableSilver []int    // Silver resources
    Owners          []string // Guild/Player owners
    PublicFee       []int    // Public access fees
    AssociateFee    []int    // Associate fees
    Coordinates     [][]int  // X,Y coordinate pairs
    Durability      []int    // Building durability values
    Permission      []int    // Permission levels
}
```

### Location ID Patterns

- **Numeric zones**: Standard zones (`"1"`, `"2"`, etc.)
- **`BLACKBANK-*`**: Blackbank locations
- **`*-HellDen`**: Hell dungeon variants
- **`*-Auction2`**: Secondary marketplace (Caerleon)
- **`*@*`**: Rest zones or smugglers dens

---

## 9. Quick Decode Guide

### Example: `Filites-Izohun` (T8)

- **F** → F-shaped road layout
- **T8** → Tier 8 (highest difficulty)
- **-un** → Contains a **Large Golden Chest**

### Example: `Secent-Al-Duosom` (T6)

- **Sec-** → Avalonian **Rest zone** (hideout placement OK)
- **-Al-** → Connector word
- **T6** → Always T6 for rest zones

### Example: `Cases-Ugumlos` (T6)

- **C** → C-shaped road layout
- **T6** → Tier 6
- **-los** → Contains a **Large Green Chest**

### Example: `Coros-Atinaum` (T6)

- **C** → C-shaped road layout
- **T6** → Tier 6
- **-aum** → Contains a **Large Wood Node**

---

## 10. Portal Naming Rules

- Portals with a **hyphen (-)** in the name lead to **another Avalon region**
- Portals with just a **region name** (no hyphen) lead to that region on the **Royal Continent or Outlands**
- Each map has **large and small sockets** that randomly fill with: chests, entrances, portals, and resources
- Socket count is based on the **letter shape** of the map

---

## Sources

- [Roads of Avalon - Albion Online Wiki](https://wiki.albiononline.com/wiki/Roads_of_Avalon)
- [Avalonian Road Name: Secrets Revealed - Albion Forum](https://forum.albiononline.com/index.php/Thread/136690-Avalonian-road-name-secrets-revealed/)
- [Avalonian Road Suffixes - Albion Forum](https://forum.albiononline.com/index.php/Thread/203449-Avalonian-Road-suffixes/)
- [Avalonian Road Codex - Albion Forum](https://forum.albiononline.com/index.php/Thread/133707-Avalonian-Road-Codex/)
- [Avalon Map Tool](https://avalonroads-97617.web.app/)
- [Albion Navigator (GitHub)](https://github.com/SugarF0x/albion-navigator)
- [Treasure Sites - Albion Online Wiki](https://wiki.albiononline.com/wiki/Treasure_Sites)
- [Cluster Map - Albion Online Wiki](https://wiki.albiononline.com/wiki/Cluster_Map)
