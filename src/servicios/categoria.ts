import { categoriasMock } from '../mocks/categorias';
import { RespuestaPaginada } from '../tipos/api';
import { Categoria } from '../tipos/categorias';

export const categoriasServicio = {
  obtenerCategorias: async (): Promise<RespuestaPaginada<Categoria>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Ordenamos por el campo "orden" (copia, para no tocar el mock original)
    const ordenadas = [...categoriasMock].sort((a, b) => a.orden - b.orden);

    return {
      datos: ordenadas,
      meta: {
        total: ordenadas.length,
        pagina: 1,
        porPagina: 20,
      },
    };
  },
};