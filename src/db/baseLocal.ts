// src/db/baseLocal.ts
import * as SQLite from 'expo-sqlite';

let promesaBase: Promise<SQLite.SQLiteDatabase> | null = null;


export const obtenerBase = (): Promise<SQLite.SQLiteDatabase> => {
  if (!promesaBase) {
    promesaBase = (async () => {
      const db = await SQLite.openDatabaseAsync('miciudad.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS lugares (
          id TEXT PRIMARY KEY NOT NULL,
          nombre TEXT NOT NULL,
          categoria_id TEXT NOT NULL,
          json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS categorias (
          id TEXT PRIMARY KEY NOT NULL,
          orden INTEGER NOT NULL,
          json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS visitas_pendientes (
          id TEXT PRIMARY KEY NOT NULL,
          lugar_id TEXT NOT NULL,
          origen TEXT NOT NULL,
          fecha_hora TEXT NOT NULL,
          nota TEXT,
          foto_local TEXT,
          intentos INTEGER NOT NULL DEFAULT 0
        );
      `);
      return db;
    })();
  }
  return promesaBase;
};