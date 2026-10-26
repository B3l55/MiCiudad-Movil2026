// src/servicios/eventos.ts
import { RespuestaLista } from '../tipos/api';
import { Evento } from '../tipos/eventos';
import { fetchApi } from './cliente';

export const eventosServicio = {
  obtenerEventos: async (): Promise<RespuestaLista<Evento>> => {
    return fetchApi<RespuestaLista<Evento>>('/eventos');
  },
  obtenerEventoPorId: async (id: string): Promise<Evento> => {
    return fetchApi<Evento>(`/eventos/${id}`);
  }
};