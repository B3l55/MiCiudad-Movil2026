// src/servicios/favoritos.ts
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.4:3000'; // Ajustá según tu IP local

async function obtenerHeaders() {
  const token = await SecureStore.getItemAsync('token_sesion');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const favoritosServicio = {
  obtenerFavoritosIds: async (): Promise<string[]> => {
    try {
      const headers = await obtenerHeaders();
      const respuesta = await fetch(`${BASE_URL}/favoritos`, {
        method: 'GET',
        headers,
      });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();

      // Mapea flexiblemente para capturar lugarId, lugar_id, lugar.id o id
      if (Array.isArray(json.datos)) {
        return json.datos.map((fav: any) => 
          fav.lugarId || fav.lugar_id || fav.lugar?.id || fav.id
        ).filter(Boolean);
      }
      return [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  },

  agregarFavorito: async (lugarId: string) => {
    try {
      const headers = await obtenerHeaders();
      const respuesta = await fetch(`${BASE_URL}/favoritos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lugarId }),
      });
      if (!respuesta.ok) throw new Error('Error al agregar favorito');
      return await respuesta.json();
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  },

  eliminarFavorito: async (lugarId: string) => {
    try {
      const headers = await obtenerHeaders();
      const respuesta = await fetch(`${BASE_URL}/favoritos/${lugarId}`, {
        method: 'DELETE',
        headers,
      });
      if (!respuesta.ok) throw new Error('Error al eliminar favorito');
      return await respuesta.json();
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  }
};