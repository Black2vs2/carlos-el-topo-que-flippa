import { OrderWithKey } from '@custom-types/DTO';
import { Injectable, Logger } from '@nestjs/common';
import { SqliteService } from '../../database/sqlite.service';
import type Database from 'better-sqlite3';

@Injectable()
export class OrdersDatabaseService {
  private readonly logger = new Logger(OrdersDatabaseService.name);
  private upsertStmt: Database.Statement;
  private getAllStmt: Database.Statement;
  private getAllNonExpiredStmt: Database.Statement;
  private deleteByCityStmt: Database.Statement;
  private deleteAllStmt: Database.Statement;
  private deleteExpiredStmt: Database.Statement;
  private countStmt: Database.Statement;
  private countByCityStmt: Database.Statement;

  constructor(private sqlite: SqliteService) {}

  initStatements() {
    const db = this.sqlite.db;

    this.upsertStmt = db.prepare(`
      INSERT INTO orders (Key, Id, ItemTypeId, ItemGroupTypeId, LocationId, QualityLevel, EnchantmentLevel, UnitPriceSilver, Amount, AuctionType, Expires, SeededAt)
      VALUES (@Key, @Id, @ItemTypeId, @ItemGroupTypeId, @LocationId, @QualityLevel, @EnchantmentLevel, @UnitPriceSilver, @Amount, @AuctionType, @Expires, @SeededAt)
      ON CONFLICT(Key) DO UPDATE SET
        UnitPriceSilver = CASE WHEN excluded.UnitPriceSilver < orders.UnitPriceSilver THEN excluded.UnitPriceSilver ELSE orders.UnitPriceSilver END,
        Amount = excluded.Amount,
        Expires = excluded.Expires,
        SeededAt = excluded.SeededAt
    `);

    this.getAllStmt = db.prepare('SELECT * FROM orders');
    this.getAllNonExpiredStmt = db.prepare("SELECT * FROM orders WHERE Expires >= datetime('now')");
    this.deleteByCityStmt = db.prepare('DELETE FROM orders WHERE LocationId = ?');
    this.deleteAllStmt = db.prepare('DELETE FROM orders');
    this.deleteExpiredStmt = db.prepare("DELETE FROM orders WHERE Expires < datetime('now')");
    this.countStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE Expires >= datetime('now')");
    this.countByCityStmt = db.prepare(
      "SELECT LocationId, COUNT(*) as count FROM orders WHERE Expires >= datetime('now') GROUP BY LocationId"
    );

    this.logger.log('Prepared statements initialized');
  }

  private rowToOrder(row: Record<string, unknown>): OrderWithKey {
    return {
      ...row,
      Expires: new Date(row['Expires'] as string),
      SeededAt: new Date(row['SeededAt'] as string),
    } as OrderWithKey;
  }

  getAll(): OrderWithKey[] {
    return this.getAllStmt.all().map((row) => this.rowToOrder(row as Record<string, unknown>));
  }

  getAllNonExpired(): OrderWithKey[] {
    return this.getAllNonExpiredStmt.all().map((row) => this.rowToOrder(row as Record<string, unknown>));
  }

  deleteByCity(cityId: number): number {
    const result = this.deleteByCityStmt.run(cityId);
    return result.changes;
  }

  deleteAll(): number {
    const result = this.deleteAllStmt.run();
    return result.changes;
  }

  deleteExpired(): number {
    const result = this.deleteExpiredStmt.run();
    return result.changes;
  }

  getOrderCount(): number {
    return (this.countStmt.get() as { count: number }).count;
  }

  getOrderCountsByCity(): Record<number, number> {
    const rows = this.countByCityStmt.all() as { LocationId: number; count: number }[];
    const result: Record<number, number> = {};
    for (const row of rows) {
      result[row.LocationId] = row.count;
    }
    return result;
  }

  saveIngestableOrders(sanitizedOrders: OrderWithKey[]): { total: number; created: number; skipped: number; durationMs: number } {
    const start = Date.now();
    let created = 0;

    const upsertMany = this.sqlite.db.transaction((orders: OrderWithKey[]) => {
      for (const order of orders) {
        const result = this.upsertStmt.run({
          Key: order.Key,
          Id: order.Id ?? null,
          ItemTypeId: order.ItemTypeId,
          ItemGroupTypeId: order.ItemGroupTypeId,
          LocationId: order.LocationId,
          QualityLevel: order.QualityLevel,
          EnchantmentLevel: order.EnchantmentLevel,
          UnitPriceSilver: order.UnitPriceSilver,
          Amount: order.Amount,
          AuctionType: order.AuctionType,
          Expires: order.Expires instanceof Date ? order.Expires.toISOString() : String(order.Expires),
          SeededAt: order.SeededAt instanceof Date ? order.SeededAt.toISOString() : String(order.SeededAt),
        });
        if (result.changes > 0) created++;
      }
    });

    upsertMany(sanitizedOrders);
    const durationMs = Date.now() - start;
    const skipped = sanitizedOrders.length - created;

    this.logger.log(`Ingested ${sanitizedOrders.length} orders in ${durationMs}ms (created/updated: ${created}, skipped: ${skipped})`);

    return { total: sanitizedOrders.length, created, skipped, durationMs };
  }
}
