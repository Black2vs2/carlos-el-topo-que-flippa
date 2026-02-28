import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqliteService.name);
  db: Database.Database;

  onModuleInit() {
    const dbPath = join(process.cwd(), 'data', 'albion-market.db');
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });

    this.db = new Database(dbPath);
    this.logger.log(`SQLite database opened at ${dbPath}`);

    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('mmap_size = 268435456');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        Key TEXT UNIQUE NOT NULL,
        Id INTEGER,
        ItemTypeId TEXT NOT NULL,
        ItemGroupTypeId TEXT NOT NULL,
        LocationId INTEGER NOT NULL,
        QualityLevel INTEGER NOT NULL,
        EnchantmentLevel INTEGER NOT NULL,
        UnitPriceSilver INTEGER NOT NULL,
        Amount INTEGER NOT NULL,
        AuctionType TEXT NOT NULL,
        Expires TEXT NOT NULL,
        SeededAt TEXT NOT NULL
      )
    `);

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(LocationId)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_orders_auction_item ON orders(AuctionType, ItemTypeId)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_orders_expires ON orders(Expires)');

    this.logger.log('SQLite tables and indexes initialized');
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
      this.logger.log('SQLite database closed');
    }
  }
}
