// src/servicios/eventosGuardados.ts
import * as SecureStore from 'expo-secure-store';

import { BASE_URL } from '../config/api';

async function obtenerHeaders() {
  const token = await SecureStore.getItemAsync('token_sesion');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const eventosGuardadosServicio = {
  // GET /yo/eventos-guardados
  obtenerGuardados: async (): Promise<any[]> => {
    try {
      const headers = await obtenerHeaders();
      const respuesta = await fetch(`${BASE_URL}/yo/eventos-guardados`, {
        method: 'GET',
        headers,
      });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();
      const lista = json.datos || json;
      return Array.isArray(lista) ? lista : [];
    } catch (error) {
      console.error('Error al obtener guardados:', error);
      return [];
    }
  },

  esGuardado: async (id: string): Promise<boolean> => {
    const guardados = await eventosGuardadosServicio.obtenerGuardados();
    return guardados.some((item: any) => {
      const itemID = item.id || item.eventoId || item._id || item;
      return String(itemID) === String(id);
    });
  },

  // PUT /yo/eventos-guardados/:eventoId | DELETE /yo/eventos-guardados/:eventoId
  alternarGuardado: async (id: string): Promise<boolean> => {
    try {
      const guardadoActualmente = await eventosGuardadosServicio.esGuardado(id);
      const headers = await obtenerHeaders();

      if (guardadoActualmente) {
        const respuesta = await fetch(`${BASE_URL}/yo/eventos-guardados/${id}`, {
          method: 'DELETE',
          headers,
        });
        if (!respuesta.ok) throw new Error('Error al quitar de guardados');
        return false;
      } else {
        const respuesta = await fetch(`${BASE_URL}/yo/eventos-guardados/${id}`, {
          method: 'PUT',
          headers,
        });

        if (!respuesta.ok) {
          const errJson = await respuesta.json().catch(() => ({}));
          throw new Error(errJson.mensaje || 'No se puede guardar este evento.');
        }
        return true;
      }
    } catch (error) {
      console.error('Error al guardar/eliminar evento:', error);
      throw error;
    }
  }
};