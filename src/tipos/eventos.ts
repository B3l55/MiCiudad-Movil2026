import { Coordenadas } from './lugares';

export type EstadoEvento = 'programado' | 'suspendido' | 'cancelado' | 'finalizado';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  lugarId: string | null; // si pertenece a un lugar del catálogo
  direccionLibre: string | null; // que lugar es
  coordenadas: Coordenadas | null; // solo si no hay lugarId
  inicio: string; // ISO 8601 con zona: "2026-11-14T21:00:00-03:00"
  fin: string | null;
  imagenUrl: string | null;
  precio: number | null; // 0 = gratis, null = no aplica
  estado: EstadoEvento;
}