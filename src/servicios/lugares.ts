// src/servicios/lugares.ts
import { guardarLugares, leerLugar, leerLugares } from '../db/cacheCatalogo';
import { RespuestaLista } from '../tipos/api';
import { Lugar } from '../tipos/lugares';
import { fetchApi } from './cliente';


const RUTA_LUGARES = '/lugares?porPagina=500';

const aRespuesta = (datos: Lugar[]): RespuestaLista<Lugar> => ({
  datos,
  meta: { total: datos.length, pagina: 1, porPagina: datos.length },
});

export const lugaresServicio = {
  obtenerLugares: async (): Promise<RespuestaLista<Lugar>> => {
    try {
      const res = await fetchApi<RespuestaLista<Lugar>>(RUTA_LUGARES);
      
      guardarLugares(res.datos || [])
        .then(() => console.log('Catálogo guardado en el teléfono:', (res.datos || []).length, 'lugares'))
        .catch((e) => console.log('No se pudo guardar el catálogo local:', e));
      return res;
    } catch (error) {
      
      const guardados = await leerLugares();
      if (guardados.length === 0) throw error; 
      console.log('Sin conexión: lugares desde el teléfono');
      return aRespuesta(guardados);
    }
  },

  obtenerLugarPorId: async (id: string): Promise<Lugar> => {
    try {
      const res = await fetchApi<any>(`/lugares/${id}`);
     
      if (res.datos && Array.isArray(res.datos)) return res.datos[0];
      if (res.datos) return res.datos;
      return res;
    } catch (error) {
      
      const guardado = await leerLugar(id);
      if (guardado) return guardado;
      throw error;
    }
  },

  obtenerLugaresPorCategoria: async (categoriaId: string): Promise<RespuestaLista<Lugar>> => {
    try {
      return await fetchApi<RespuestaLista<Lugar>>(`/lugares?categoriaId=${categoriaId}&porPagina=500`);
    } catch (error) {
      
      const guardados = (await leerLugares()).filter((lugar) => lugar.categoriaId === categoriaId);
      if (guardados.length === 0) throw error;
      return aRespuesta(guardados);
    }
  },
};