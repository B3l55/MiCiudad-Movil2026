// src/db/cacheCatalogo.ts
import { Categoria } from '../tipos/categorias';
import { Lugar } from '../tipos/lugares';
import { obtenerBase } from './baseLocal';


let colaEscritura: Promise<unknown> = Promise.resolve();
const enCola = <T>(tarea: () => Promise<T>): Promise<T> => {
  const resultado = colaEscritura.then(tarea);
  colaEscritura = resultado.catch(() => undefined); // si una falla, la fila sigue
  return resultado;
};

// Guarda cada lugar (INSERT OR REPLACE) y borra los que ya no vienen de la API (dados de baja)
export const guardarLugares = (lugares: Lugar[]): Promise<void> =>
  enCola(async () => {
    const db = await obtenerBase();
    for (const lugar of lugares) {
      await db.runAsync(
        'INSERT OR REPLACE INTO lugares (id, nombre, categoria_id, json) VALUES (?, ?, ?, ?)',
        lugar.id,
        lugar.nombre ?? '',
        lugar.categoriaId ?? '',
        JSON.stringify(lugar)
      );
    }
    const ids = lugares.map((lugar) => lugar.id);
    if (ids.length === 0) {
      await db.runAsync('DELETE FROM lugares');
    } else {
      await db.runAsync(`DELETE FROM lugares WHERE id NOT IN (${ids.map(() => '?').join(',')})`, ids);
    }
  });

export const leerLugares = async (): Promise<Lugar[]> => {
  const db = await obtenerBase();
  const filas = await db.getAllAsync<{ json: string }>('SELECT json FROM lugares ORDER BY nombre');
  return filas.map((fila) => JSON.parse(fila.json) as Lugar);
};

export const leerLugar = async (id: string): Promise<Lugar | null> => {
  const db = await obtenerBase();
  const fila = await db.getFirstAsync<{ json: string }>('SELECT json FROM lugares WHERE id = ?', id);
  return fila ? (JSON.parse(fila.json) as Lugar) : null;
};

export const guardarCategorias = (categorias: Categoria[]): Promise<void> =>
  enCola(async () => {
    const db = await obtenerBase();
    for (const categoria of categorias) {
      await db.runAsync(
        'INSERT OR REPLACE INTO categorias (id, orden, json) VALUES (?, ?, ?)',
        categoria.id,
        categoria.orden ?? 0,
        JSON.stringify(categoria)
      );
    }
    const ids = categorias.map((categoria) => categoria.id);
    if (ids.length === 0) {
      await db.runAsync('DELETE FROM categorias');
    } else {
      await db.runAsync(`DELETE FROM categorias WHERE id NOT IN (${ids.map(() => '?').join(',')})`, ids);
    }
  });

export const leerCategorias = async (): Promise<Categoria[]> => {
  const db = await obtenerBase();
  const filas = await db.getAllAsync<{ json: string }>('SELECT json FROM categorias ORDER BY orden');
  return filas.map((fila) => JSON.parse(fila.json) as Categoria);
};