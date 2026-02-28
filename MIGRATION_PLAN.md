# Replace MongoDB/Prisma with SQLite (better-sqlite3) + Precomputed Cache

## Context

The current system uses MongoDB via Prisma ORM with critical performance and correctness issues:
- **Race conditions**: `saveIngestableOrders` does `findFirst` + `create/update` without atomicity — concurrent Go clients can cause duplicate inserts
- **Fire-and-forget**: `forEach(async ...)` at `orders-database.service.ts:21` returns before any DB write completes
- **N+1 queries**: Each order does an individual `findFirst` + `create/update` (200 DB round-trips for 100 orders)
- **Full table scan every 3s**: `getProfitable()` loads ALL orders into memory on every frontend poll
- **Missing index on LocationId**: `deleteByCity` does a full collection scan
- **No caching, no metrics, no expiry cleanup**

The goal: replace with SQLite (better-sqlite3) using raw SQL, atomic UPSERT, precomputed cache, auto-expiry, and comprehensive logging.

---

## Step 1: Install dependencies

- `npm install better-sqlite3 @types/better-sqlite3`
- Remove `@prisma/client` from dependencies and `prisma` from devDependencies in `package.json`

## Step 2: Create `sqlite.service.ts` (replaces `prisma.service.ts`)

**New file**: `apps/backend/src/database/sqlite.service.ts`

- Opens a `better-sqlite3` Database at `./data/albion-market.db`
- Sets PRAGMAs: `journal_mode=WAL`, `synchronous=NORMAL`, `cache_size=-64000` (64MB), `busy_timeout=5000`, `temp_store=MEMORY`, `mmap_size=268435456`
- Creates the `orders` table with proper schema and indexes:
  - `Key TEXT UNIQUE` (for UPSERT conflict detection)
  - `CREATE INDEX idx_orders_location ON orders(LocationId)` (for deleteByCity)
  - `CREATE INDEX idx_orders_auction_item ON orders(AuctionType, ItemTypeId)` (for profitable query)
  - `CREATE INDEX idx_orders_expires ON orders(Expires)` (for expiry cleanup)
- Implements `OnModuleInit` and `OnModuleDestroy` lifecycle hooks

## Step 3: Rewrite `orders-database.service.ts`

**File**: `apps/backend/src/orders/database/orders-database.service.ts`

Key changes:
- Replace Prisma with `SqliteService` injection
- **Atomic UPSERT**: `INSERT ... ON CONFLICT(Key) DO UPDATE SET UnitPriceSilver = CASE WHEN excluded.UnitPriceSilver < orders.UnitPriceSilver THEN excluded.UnitPriceSilver ELSE orders.UnitPriceSilver END` — eliminates race conditions
- **Batch transaction**: Wrap all orders in a single `db.transaction()` — eliminates N+1 (1 transaction instead of 200 round-trips)
- **Synchronous API**: better-sqlite3 is synchronous — eliminates the fire-and-forget `forEach(async)` bug
- **Prepared statements**: Created once in `initStatements()`, reused for every call
- Add `getAllNonExpired()` method that filters `WHERE Expires >= datetime('now')`
- Add `deleteExpired()` method for auto-cleanup
- Add `getOrderCount()` for metrics
- Add row-to-`OrderWithKey` mapping (dates stored as ISO TEXT, mapped back to JS Date)
- Return structured results from `saveIngestableOrders`: `{ total, created, skipped, durationMs }`

## Step 4: Rewrite `orders-seed-database.service.ts`

**File**: `apps/backend/src/orders/database/orders-seed-database.service.ts`

- Replace `PrismaService` with `OrdersDatabaseService` (reuse `saveIngestableOrders` for batch UPSERT)
- Fixes the same `forEach(async)` fire-and-forget bug in `seedWithprofitable()`
- Add logging for seed operations

## Step 5: Rewrite `orders.service.ts` — precomputed cache, expiry, metrics

**File**: `apps/backend/src/orders/orders.service.ts`

Key additions:
- **Precomputed cache**: `cachedProfitable: ProfitableOrders[]` array in memory
- `recomputeProfitableCache()` called after every mutation (ingest, delete, seed, expiry)
- `getProfitable()` returns cached array directly (0ms DB latency)
- **Auto-expiry**: `setInterval` every 60s calls `deleteExpired()`, recomputes cache if orders were removed
- **WebSocket push**: After every cache recompute, call `OrdersGateway.updateClientsWithNewOrders()` to push to connected clients
- **Metrics**: Track `totalIngestions`, `totalOrdersIngested`, `lastIngestionAt`, `cacheComputeMs`; expose via `getMetrics()`
- **Performance fix**: Replace `splittedByKey.set(key, [...existing, o])` with `existing.push(o)` (avoids O(n^2) array copying)
- Inject `OrdersGateway` into constructor
- `onModuleInit()`: call `initStatements()`, compute initial cache, start expiry timer

## Step 6: Update `orders.controller.ts`

**File**: `apps/backend/src/orders/orders.controller.ts`

- Remove unnecessary `async/await` (service methods are now synchronous)
- Add `GET /orders/metrics` endpoint for monitoring

## Step 7: Update `orders.module.ts`

**File**: `apps/backend/src/orders/orders.module.ts`

- Replace `PrismaService` with `SqliteService` in providers
- Ensure provider order: `SqliteService` before `OrdersDatabaseService` before `OrdersService` (for init lifecycle)

## Step 8: Fix `app.module.ts` bug

**File**: `apps/backend/src/app.module.ts`

- Remove `OrdersController` from `AppModule.controllers` (it's already declared in `OrdersModule`, causing duplicate route registration)

## Step 9: Update config files

- **`apps/backend/webpack.config.js`**: Add `externals: { 'better-sqlite3': 'commonjs better-sqlite3' }` (native module can't be bundled by webpack)
- **`apps/backend/tsconfig.json`**: Remove `@prisma-generated/*` path alias
- **`apps/backend/.env`**: Replace `DATABASE_URL` with `DATABASE_PATH="./data/albion-market.db"`
- **`.gitignore`**: Add `*.db`, `*.db-wal`, `*.db-shm`, `data/`

## Step 10: Delete Prisma artifacts

- Delete `apps/backend/prisma/` directory (schema.prisma, generated client)
- Delete `apps/backend/src/database/prisma.service.ts`

---

## Bugs Fixed

| Bug | Fix |
|-----|-----|
| Race condition (find + create/update) | Atomic `INSERT ... ON CONFLICT DO UPDATE` UPSERT |
| Fire-and-forget `forEach(async)` | Synchronous better-sqlite3 with `for...of` in transaction |
| N+1 queries (200 round-trips/100 orders) | Single transaction wrapping all prepared statements |
| Full table scan every 3s | Precomputed cache, served from memory |
| Missing LocationId index | `CREATE INDEX idx_orders_location` |
| No caching | In-memory `cachedProfitable` array |
| Expired orders accumulate | 60s interval cleanup + `idx_orders_expires` index |
| Duplicate controller registration | Remove `OrdersController` from `AppModule` |
| O(n^2) array spread in profitable algo | Mutate array in-place with `.push()` |

## Performance Expectations

| Operation | Before (MongoDB/Prisma) | After (SQLite/better-sqlite3) |
|-----------|------------------------|-------------------------------|
| Ingest 100 orders | ~200 round-trips, ~500ms, race conditions | 1 transaction, <10ms, atomic |
| GET /profitable | Full scan + compute, ~50-200ms | Cache return, <1ms |
| deleteByCity | Full collection scan | Indexed delete, <5ms |
| Expiry cleanup | None | Auto every 60s, indexed |

## Verification

1. `npm install` — confirm better-sqlite3 installs (native build)
2. `npm run start:backend` — confirm server starts, SQLite DB created at `./data/albion-market.db`
3. `GET /orders/metrics` — confirm metrics endpoint returns valid JSON
4. `POST /orders/marketorders.ingest` with test data — confirm ingestion logged with timing
5. `GET /orders/profitable` — confirm returns cached results instantly
6. `GET /orders` — confirm all orders returned with proper Date fields
7. `POST /orders/delete-by-city` — confirm deletion and cache recomputation
8. Check server logs for expiry cleanup messages after 60s
