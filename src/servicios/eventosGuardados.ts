// src/servicios/eventosGuardados.ts
import * as SecureStore from 'expo-secure-store';

// Recordá usar la IP correcta donde corre tu Docker
const BASE_URL = 'http://192.168.1.4:3000';

async function obtenerHeaders() {
  const token = await SecureStore.getItemAsync('token_sesion');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const eventosGuardadosServicio = {
  // 1. Obtiene los IDs de los eventos guardados por el usuario logueado
  obtenerGuardados: async (): Promise<string[]> => {
    try {
      const headers = await obtenerHeaders();
      const respuesta = await fetch(`${BASE_URL}/eventos-guardados`, {
        method: 'GET',
        headers,
      });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();
      
      // Ajustá 'item.eventoId' o 'item.id' según la estructura que devuelva el Swagger
      if (json.datos) {
        return json.datos.map((item: any) => item.eventoId || item.id);
      }
      return [];
    } catch (error) {
      console.error('Error al obtener eventos guardados:', error);
      return [];
    }
  },
  
  // 2. Verifica si un evento específico está guardado
  esGuardado: async (id: string): Promise<boolean> => {
    const guardados = await eventosGuardadosServicio.obtenerGuardados();
    return guardados.includes(id);
  },

  // 3. Agrega o elimina el evento consultando directamente a la API
  alternarGuardado: async (id: string): Promise<boolean> => {
    try {
      const guardadoActualmente = await eventosGuardadosServicio.esGuardado(id);
      const headers = await obtenerHeaders();

      if (guardadoActualmente) {
        // Eliminar evento guardado
        const respuesta = await fetch(`${BASE_URL}/eventos-guardados/${id}`, {
          method: 'DELETE',
          headers,
        });
        if (!respuesta.ok) throw new Error('Error al eliminar');
        return false; // Retorna false porque ya no está guardado
      } else {
        // Agregar evento guardado
        const respuesta = await fetch(`${BASE_URL}/eventos-guardados`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ eventoId: id }),
        });
        if (!respuesta.ok) throw new Error('Error al guardar');
        return true; // Retorna true porque ahora está guardado
      }
    } catch (error) {
      console.error('Error al alternar evento guardado:', error);
      return false;
    }
  }
};