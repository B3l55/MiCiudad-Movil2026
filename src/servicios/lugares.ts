import { lugaresMock } from '../mocks/lugares';
import { simulacion } from '../mocks/simulacion';
import { ErrorApi, RespuestaPaginada } from '../tipos/api';
import { Lugar } from '../tipos/lugares';

export interface FiltrosLugares {
  categoriaId?: string;
  busqueda?: string;
}

const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Quita tildes y pasa a minúsculas: "Colón" y "colon" deben coincidir
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const lugaresServicio = {
  obtenerLugares: async (filtros: FiltrosLugares = {}): Promise<RespuestaPaginada<Lugar>> => {
    await esperar(500);

    if (simulacion.fallarRed) {
      throw new ErrorApi('ERROR_RED', 'No hay conexión con el servidor.');
    }

    let resultado = simulacion.listaVacia ? [] : lugaresMock.filter(l => l.activo);

    if (filtros.categoriaId) {
      resultado = resultado.filter(l => l.categoriaId === filtros.categoriaId);
    }

    if (filtros.busqueda?.trim()) {
      const texto = normalizar(filtros.busqueda);
      resultado = resultado.filter(l => normalizar(l.nombre).includes(texto));
    }

    return {
      datos: resultado,
      meta: { total: resultado.length, pagina: 1, porPagina: 20 },
    };
  },

  obtenerLugarPorId: async (id: string): Promise<Lugar> => {
    await esperar(500);

    if (simulacion.fallarRed) {
      throw new ErrorApi('ERROR_RED', 'No hay conexión con el servidor.');
    }

    const lugar = lugaresMock.find(l => l.id === id && l.activo);
    if (!lugar) {
      throw new ErrorApi('LUGAR_NO_ENCONTRADO', 'No existe ese lugar.');
    }
    return lugar;
  },
};