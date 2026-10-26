// src/servicios/categoria.ts
import { RespuestaLista } from '../tipos/api';
import { Categoria } from '../tipos/categorias';
import { fetchApi } from './cliente';

export const categoriasServicio = {
  obtenerCategorias: async (): Promise<RespuestaLista<Categoria>> => {
    // Llama al endpoint real de categorías en tu API
    return fetchApi<RespuestaLista<Categoria>>('/categorias');
  },
};