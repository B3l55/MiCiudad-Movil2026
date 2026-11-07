// src/db/colaVisitas.ts
import { obtenerBase } from './baseLocal';

export interface VisitaPendiente {
  id: string;
  lugarId: string;
  origen: 'qr' | 'gps' | 'manual';
  fechaHora: string;
  nota: string | null;
  fotoLocal: string | null; 
  intentos: number;
}

interface Fila {
  id: string;
  lugar_id: string;
  origen: string;
  fecha_hora: string;
  nota: string | null;
  foto_local: string | null;
  intentos: number;
}

const aVisita = (fila: Fila): VisitaPendiente => ({
  id: fila.id,
  lugarId: fila.lugar_id,
  origen: fila.origen as VisitaPendiente['origen'],
  fechaHora: fila.fecha_hora,
  nota: fila.nota,
  fotoLocal: fila.foto_local,
  intentos: fila.intentos,
});

export const guardarPendiente = async (visita: Omit<VisitaPendiente, 'intentos'>): Promise<void> => {
  const db = await obtenerBase();
  await db.runAsync(
    'INSERT OR REPLACE INTO visitas_pendientes (id, lugar_id, origen, fecha_hora, nota, foto_local, intentos) VALUES (?, ?, ?, ?, ?, ?, 0)',
    visita.id,
    visita.lugarId,
    visita.origen,
    visita.fechaHora,
    visita.nota,
    visita.fotoLocal
  );
};


export const leerPendientes = async (): Promise<VisitaPendiente[]> => {
  const db = await obtenerBase();
  const filas = await db.getAllAsync<Fila>('SELECT * FROM visitas_pendientes ORDER BY fecha_hora ASC');
  return filas.map(aVisita);
};

export const borrarPendiente = async (id: string): Promise<void> => {
  const db = await obtenerBase();
  await db.runAsync('DELETE FROM visitas_pendientes WHERE id = ?', id);
};

export const sumarIntento = async (id: string): Promise<void> => {
  const db = await obtenerBase();
  await db.runAsync('UPDATE visitas_pendientes SET intentos = intentos + 1 WHERE id = ?', id);
};