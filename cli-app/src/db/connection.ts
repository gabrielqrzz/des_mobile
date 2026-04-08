import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "../../data/geo.db");

// Ensure the directory for the SQLite file exists to avoid runtime errors
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS uf (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      sigla TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS cidade (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      uf_id TEXT NOT NULL,
      FOREIGN KEY (uf_id) REFERENCES uf(id)
    );

    CREATE TABLE IF NOT EXISTS regiao (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      cidade_id TEXT NOT NULL,
      FOREIGN KEY (cidade_id) REFERENCES cidade(id)
    );
  `);
}
