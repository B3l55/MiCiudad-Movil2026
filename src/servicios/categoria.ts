// src/servicios/categoria.ts
import { guardarCategorias, leerCategorias } from '../db/cacheCatalogo';
import { RespuestaLista } from '../tipos/api';
import { Categoria } from '../tipos/categorias';
import { fetchApi } from './cliente';

export const categoriasServicio = {
  obtenerCategorias: async (): Promise<RespuestaLista<Categoria>> => {
    try {
      const res = await fetchApi<RespuestaLista<Categoria>>('/categorias');
      
      await guardarCategorias(res.datos || []).catch((e) => console.log('No se pudieron guardar las categorías:', e));
      return res;
    } catch (error) {
      // Sin conexión: devolvemos lo último que se guardó
      const guardadas = await leerCategorias();
      if (guardadas.length === 0) throw error;
      return {
        datos: guardadas,
        meta: { total: guardadas.length, pagina: 1, porPagina: guardadas.length },
      };
    }
  },
};