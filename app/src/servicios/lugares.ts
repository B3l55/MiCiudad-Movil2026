// src/servicios/lugares.ts

import { lugaresMock } from '../mocks/lugares';
import { Lugar } from '../tipos/lugares';

// 1. PAGINACION.Definimos la forma exacta de la respuesta que va a tener la API de la cátedra
export interface RespuestaPaginada<T> {
  datos: T[];
  meta: {
    total: number;
    pagina: number;
    porPagina: number;
  };
}

// 2. Creamos el servicio con funciones asíncronas
export const lugaresServicio = {
  
  // Función para traer todos los lugares
  obtenerLugares: async (): Promise<RespuestaPaginada<Lugar>> => {
    // Simulamos una demora de red de medio segundo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Devolvemos el mock envuelto en la estructura que pide el PRD
    return {
      datos: lugaresMock,
      meta: {
        total: lugaresMock.length,
        pagina: 1,
        porPagina: 20
      }
    };
  },

  // Función para traer un solo lugar cuando el usuario entra al detalle
  obtenerLugarPorId: async (id: string): Promise<Lugar | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return lugaresMock.find(lugar => lugar.id === id);
  }
};