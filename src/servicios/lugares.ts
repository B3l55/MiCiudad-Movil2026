// src/servicios/lugares.ts
import { RespuestaLista, RespuestaUno } from '../tipos/api';
import { Lugar } from '../tipos/lugares';
import { fetchApi } from './cliente';

export const lugaresServicio = {
  obtenerLugares: async (): Promise<RespuestaLista<Lugar>> => {
    return fetchApi<RespuestaLista<Lugar>>('/lugares');
  },
  
  obtenerLugarPorId: async (id: string): Promise<Lugar> => {
    const res = await fetchApi<any>(`/lugares/${id}`);
    // Extrae el objeto de forma segura cubriendo todos los escenarios del backend
    if (res.datos && Array.isArray(res.datos)) return res.datos[0];
    if (res.datos) return res.datos;
    return res;
  },

  obtenerLugaresPorCategoria: async (categoriaId: string): Promise<RespuestaLista<Lugar>> => {
    return fetchApi<RespuestaLista<Lugar>>(`/lugares?categoriaId=${categoriaId}`);
  },
};