# Avalon Roads: Go Client Event Wiring — Implementation Analysis

## 1. The Problem

The Avalon Roads tracking feature was fully built on both ends — the NestJS backend (`POST /avalon/events`) and the React frontend (WebSocket-powered UI panels) — but **no game data ever reached the server**. The Go `albiondata-client` sniffs Albion Online's Photon wire protocol and decodes game events, but it only handled market data operations and a single event (`evRedZoneWorldMapEvent` for bandit phase tracking). All Avalon-relevant events — loot chests spawning/opening, portal entrances/exits, zone transitions — were silently dropped in the `default:` branch of `decodeEvent()`.

---

## 2. How the Go Client Works (Architecture)

Understanding the packet processing pipeline was essential before adding any code.

### 2.1 Packet Capture Layer

`client/listener.go` captures raw Albion traffic via libpcap on game server ports (5055/5056). It decodes the Photon protocol and classifies each message:

| Photon Message Type      | Decoder Function   | Type Code Param |
| ------------------------ | ------------------ | --------------- |
| `OperationRequest`       | `decodeRequest()`  | `params[253]`   |
| `OperationResponse`      | `decodeResponse()` | `params[253]`   |
| `EventDataType`          | `decodeEvent()`    | `params[252]`   |

### 2.2 Decode Layer

`client/decode.go` contains three switch statements. Each reads the type code from the params map and instantiates the appropriate handler struct. The struct is then populated via `mapstructure` — a library that maps `map[string]interface{}` keys to struct fields tagged with `mapstructure:"N"` where N is the parameter index.

**Before this change, `decodeEvent()` only handled one case:**

```go
switch EventType(eventType) {
case evRedZoneWorldMapEvent:
    event = &eventRedZoneWorldMapEvent{}
default:
    return nil, nil  // Everything else dropped
}
```

### 2.3 Routing Layer

`client/router.go` receives decoded operations on a channel and calls `op.Process(r.albionstate)` in a **goroutine** — meaning all event handlers run concurrently and must be safe for concurrent access to `albionState`.

### 2.4 Upload Layer

`client/dispatcher.go` provides two upload paths:
- `sendMsgToPublicUploaders()` — routes to NATS/HTTP/HTTP+PoW ingest servers (market data pipeline)
- `sendMsgToPrivateUploaders()` — same, but personalizes with character info first

Both parse `ConfigGlobal.PublicIngestBaseUrls` (the `-i` flag) to create uploaders. This system is designed for the broader albion-online-data ecosystem and routes through proof-of-work servers.

### 2.5 State

`client/albion_state.go` holds session state including `LocationId`, `LocationString`, `CharacterId`, `CharacterName`, and `GameServerIP`. The `LocationString` field existed but was **never populated** because the zone change handler (`operationGetGameServerByCluster.Process`) was entirely commented out.

---

## 3. Design Decision: Separate HTTP Sender

Rather than routing Avalon events through `sendMsgToPublicUploaders` (which would push them into the NATS/PoW ingest pipeline meant for market data), we created a **dedicated HTTP sender** in `client/avalon_sender.go`.

### Why not use the existing pipeline?

1. **Topic mismatch** — The pipeline uses NATS topics like `marketorders.ingest`, `goldprices.ingest`. There's no Avalon topic, and adding one would require changes to `lib/nats.go` and any upstream consumers.
2. **PoW overhead** — The HTTP+PoW uploader solves proof-of-work challenges to prevent spam on the public AlbionData Project servers. Our private backend doesn't need this.
3. **URL routing** — The existing uploaders POST to `{baseURL}/{topic}`, resulting in URLs like `http://localhost:3000/orders/marketorders.ingest`. Our backend expects `POST /avalon/events`.
4. **Fork divergence** — Keeping Avalon logic in separate files (not touching `dispatcher.go`, `lib/nats.go`, etc.) minimizes merge conflicts when pulling upstream changes from `ao-data/albiondata-client`.

### How the sender works

`sendAvalonEvent(payload)`:
1. Derives the backend base URL from `ConfigGlobal.PublicIngestBaseUrls` using the same `url.Parse` + scheme+host extraction as `pingBackend()` in `main.go`
2. JSON-marshals the payload
3. POSTs to `{backendBase}/avalon/events` with `Content-Type: application/json`
4. Includes `X-Auth-Token` header if `ConfigGlobal.IngestAuthToken` is set
5. Logs success/failure but never blocks or panics — a failed POST doesn't crash the client

The HTTP client uses a 5-second timeout and is a package-level singleton to reuse connections.

---

## 4. What Was Implemented

### 4.1 New Files

| File | Event Code | Photon Event | Purpose |
| --- | --- | --- | --- |
| `client/avalon_sender.go` | — | — | HTTP POST helper + URL derivation |
| `client/event_new_loot_chest.go` | 389 | `evNewLootChest` | Chest spawned in current zone |
| `client/event_loot_chest_opened.go` | 391 | `evLootChestOpened` | Chest opened by a player |
| `client/event_new_portal_entrance.go` | 319 | `evNewPortalEntrance` | Portal entrance appeared |
| `client/event_new_portal_exit.go` | 320 | `evNewPortalExit` | Portal exit appeared |

### 4.2 Modified Files

| File | Change |
| --- | --- |
| `client/decode.go` | Added 4 cases to `decodeEvent()` switch |
| `client/operation_get_game_server_by_cluster.go` | Rewrote: sets `state.LocationString`, sends `zone_change` event |

### 4.3 Untouched Files

No changes to the backend, frontend, `lib/nats.go`, `dispatcher.go`, `albion_state.go`, `events.go`, or `operations.go`.

---

## 5. Event Parameter Mapping

Each Photon event arrives as a `map[uint8]interface{}`. The `mapstructure` library maps these by key (as string) to struct fields. The parameter indices come from community reverse-engineering efforts.

### evNewLootChest (code 389)

```go
type eventNewLootChest struct {
    ObjectId               int    `mapstructure:"0"`
    UniqueName             string `mapstructure:"3"`
    UniqueNameWithLocation string `mapstructure:"4"`
}
```

**Chest type classification** is derived from the `UniqueName` string. The game uses internal names containing `GOLD`, `BLUE`, or `GREEN` to distinguish chest tiers. This matches the `chestType` field the backend expects (see `TrackedChest` in `avalon.types.ts`).

**Example payloads sent:**
```json
{
  "type": "chest_event",
  "chestId": "12345",
  "chestType": "GOLD",
  "chestStatus": "Spawned",
  "zoneName": "Filites-Izohun"
}
```

### evLootChestOpened (code 391)

```go
type eventLootChestOpened struct {
    ObjectId int `mapstructure:"0"`
}
```

Minimal struct — we only need the ObjectId to correlate with a previously-spawned chest. The backend matches on `chestId` to update status.

### evNewPortalEntrance / evNewPortalExit (codes 319, 320)

```go
type eventNewPortalEntrance struct {
    ObjectId   int    `mapstructure:"0"`
    UniqueName string `mapstructure:"3"`
}
```

Both portal events share the same struct shape. The backend's `handlePortalActivity()` upserts by `portalId` and the frontend shows all active portals.

### operationGetGameServerByCluster (opcode 36)

```go
type operationGetGameServerByCluster struct {
    ZoneID string `mapstructure:"0"`
}
```

This operation fires when the player transitions between zones/clusters. The `ZoneID` is the Avalon road name (e.g., `Filites-Izohun`). Previously this handler was entirely commented out. Now it:
1. Sets `state.LocationString = op.ZoneID` so subsequent chest/portal events can reference the current zone
2. Sends a `zone_change` event to the backend, which triggers map name decoding and zone history tracking

---

## 6. Event Code Verification

The event codes are determined by `iota` position in `client/events.go`. Verification:

| Constant | Line in events.go | iota value (line - 9) | Matches plan? |
| --- | --- | --- | --- |
| `evUnused` | 9 | 0 | baseline |
| `evNewPortalEntrance` | 328 | 319 | yes |
| `evNewPortalExit` | 329 | 320 | yes |
| `evNewLootChest` | 398 | 389 | yes |
| `evLootChestOpened` | 400 | 391 | yes |
| `evRedZoneWorldMapEvent` | 484 | 475 | yes (documented in existing code comments) |

The `events.go` file uses a contiguous `iota` block starting at 0 with no gaps between constant declarations, so `line_number - 9` gives the correct event code. This was cross-checked against the existing `evRedZoneWorldMapEvent` which is documented as event 475 in the handler's comments.

---

## 7. Backend Integration Points

The backend (`apps/backend/src/avalon/`) was already fully built. Here's how our Go client payloads map to backend processing:

### Event Flow

```
Go Client                    Backend                         Frontend
─────────                    ───────                         ────────
zone_change ──POST──> avalon.controller.ts
                             avalon.service.handleZoneChange()
                               ├─ mapService.decodeMapName()
                               ├─ zoneHistory.unshift()
                               ├─ gateway.emitZoneChange()    ──WS──> ZoneHistory panel
                               └─ if hasGoldenChest:
                                  gateway.emitGoldenAlert()   ──WS──> GoldenAlert toast

chest_event ──POST──> avalon.controller.ts
                             avalon.service.handleChestEvent()
                               ├─ upsert activeChests[]
                               ├─ gateway.emitChestUpdate()   ──WS──> ChestTracker panel
                               └─ gateway.emitFullState()     ──WS──> Full state refresh

portal_activity ──POST──> avalon.controller.ts
                             avalon.service.handlePortalActivity()
                               ├─ upsert portals[]
                               ├─ gateway.emitPortalUpdate()  ──WS──> PortalTracker panel
                               └─ gateway.emitFullState()     ──WS──> Full state refresh
```

### Backend State Management

- **Zone history**: capped at 20 entries, LIFO
- **Active chests**: upserted by `chestId`, no automatic cleanup (chests persist until zone changes)
- **Portals**: upserted by `portalId`, **auto-cleaned every 30s** if `lastSeen` is older than 5 minutes (`PORTAL_DECAY_MS`)

### Payload Compatibility

| Go Client Field | Backend DTO Field | Backend Type | Notes |
| --- | --- | --- | --- |
| `type` | `type` | `'zone_change' \| 'chest_event' \| 'portal_activity'` | Exact match |
| `zoneName` | `zoneName` | `string?` | Optional; falls back to `this.currentZone` |
| `chestId` | `chestId` | `string?` | Required for chest events to be processed |
| `chestType` | `chestType` | `string?` | Falls back to `'Unknown'` |
| `chestStatus` | `chestStatus` | `'Spawned' \| 'Opening' \| 'Opened' \| 'Cancelled'` | We send `Spawned` and `Opened` |
| `portalId` | `portalId` | `string?` | Required for portal events to be processed |

---

## 8. Risks and Diagnostics

### 8.1 Parameter Index Mismatch

The parameter indices (`mapstructure:"0"`, `mapstructure:"3"`, etc.) come from community reverse-engineering of Albion's Photon protocol. These may shift between game patches.

**Symptoms of wrong indices:**
- `ObjectId` is 0 → the `chestId` / `portalId` will be `"0"` instead of a real ID
- `UniqueName` is empty string → chest classification will be `"UNKNOWN"`, portal names missing
- `ZoneID` is empty → `state.LocationString` stays blank, all events show `zoneName: ""`

**How to diagnose:**

Every handler logs the raw decoded values at Debug level:
```
Got evNewLootChest: ObjectId=12345 UniqueName="LOOTCHEST_AVALON_GOLD_T8" UniqueNameWithLocation="..."
```

Run the client with `-debug` to see these. If values are zero/empty, the raw Photon params can be inspected by also enabling event debugging:
```bash
./albiondata-client.exe -debug -events 389,391,319,320
```

This triggers the listener's debug logging which prints the full `params` map:
```
EventDataType: [389]evNewLootChest - map[0:54321 3:LOOTCHEST_AVALON_GOLD_T8 4:... 252:389]
```

Compare the raw params against the struct field indices to find the correct mapping.

### 8.2 Concurrency

`router.go` dispatches each event handler in its own goroutine:
```go
go op.Process(r.albionstate)
```

Our handlers read `state.LocationString` but only `operationGetGameServerByCluster` writes it. There's a theoretical race condition, but:
- The zone change operation fires first (before entering a zone and seeing chests/portals)
- `LocationString` is a Go string (immutable once assigned), so concurrent reads are safe
- The worst case is a chest/portal event referencing an empty or stale zone name, which is non-critical

### 8.3 Network Failures

`sendAvalonEvent()` uses a 5-second HTTP timeout and logs failures at Debug level. If the backend is unreachable:
- Events are silently dropped (no retry queue)
- The Go client continues capturing game data normally
- Market data upload (the existing pipeline) is unaffected

This is intentional — Avalon tracking is best-effort. The game session shouldn't be disrupted by backend issues.

### 8.4 Chest Type Classification

The `classifyChestType()` function checks for `GOLD`, `BLUE`, or `GREEN` substrings in the `UniqueName`. This is based on the assumption that Albion's internal chest names contain these keywords (e.g., `LOOTCHEST_AVALON_GOLD_T8`). If the naming convention differs in practice, all chests will be classified as `"UNKNOWN"` — the backend still processes them, just without type info.

The naming convention doc (`docs/avalon-roads-naming-convention.md`) confirms these are the three chest tiers used in Avalon Roads.

---

## 9. Testing Procedure

### Prerequisites
- Built Go client: `cd apps/albiondata-client && go build`
- Running backend: `nx serve backend`

### Steps

1. **Start the client with debug logging:**
   ```bash
   ./albiondata-client.exe -debug -i http://localhost:3000/orders -token stompedyou
   ```

2. **Enter Albion Online and transition to any zone.** Look for:
   ```
   Got GetGameServerByCluster operation: ZoneID="Filites-Izohun"
   Avalon event sent: {"type":"zone_change","zoneName":"Filites-Izohun"}
   ```

3. **Navigate to Avalon Roads.** When near chests:
   ```
   Got evNewLootChest: ObjectId=54321 UniqueName="LOOTCHEST_AVALON_GOLD_T8" ...
   Avalon event sent: {"type":"chest_event","chestId":"54321","chestType":"GOLD",...}
   ```

4. **Walk near portals.** Look for:
   ```
   Got evNewPortalEntrance: ObjectId=98765 UniqueName="PORTAL_AVALON_01"
   Avalon event sent: {"type":"portal_activity","portalId":"98765",...}
   ```

5. **Verify backend state:**
   ```bash
   curl http://localhost:3000/avalon/state
   ```
   Should return JSON with `currentZone`, `zoneHistory`, `activeChests`, and `portals` populated.

6. **Verify frontend WebSocket panels** update in real-time.

### If parameters are wrong

Enable raw event debugging:
```bash
./albiondata-client.exe -debug -events 389,391,319,320 -i http://localhost:3000/orders -token stompedyou
```

Look for lines like:
```
EventDataType: [389]evNewLootChest - map[0:... 1:... 2:... 3:... 4:... 252:389]
```

Map the raw param keys to the data you expect, then update the `mapstructure` tags accordingly.

---

## 10. Files Changed Summary

### New files (5)
```
client/avalon_sender.go              — HTTP POST helper, URL derivation
client/event_new_loot_chest.go       — evNewLootChest (389) handler
client/event_loot_chest_opened.go    — evLootChestOpened (391) handler
client/event_new_portal_entrance.go  — evNewPortalEntrance (319) handler
client/event_new_portal_exit.go      — evNewPortalExit (320) handler
```

### Modified files (2)
```
client/decode.go                              — 4 new cases in decodeEvent() switch
client/operation_get_game_server_by_cluster.go — Rewrote: zone tracking + zone_change event
```

### Untouched
```
apps/backend/*        — Already fully built
apps/frontend/*       — Already fully built
client/events.go      — Constants already defined
client/operations.go  — Constants already defined
client/albion_state.go — LocationString field already existed
client/dispatcher.go  — Not used for Avalon events
lib/nats.go           — Not used for Avalon events
```
