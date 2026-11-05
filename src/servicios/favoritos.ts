// src/servicios/favoritos.ts
import * as SecureStore from 'expo-secure-store';

import { BASE_URL } from '../config/api';

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
      
      const respuesta = await fetch(`${BASE_URL}/yo/favoritos`, {
        method: 'GET',
        headers,
      });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();
      const lista = json.datos || json;
      
      if (Array.isArray(lista)) {
        return lista.map((item: any) => String(item.lugarId || item.id || item));
      }
      return [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  },

  
  agregarFavorito: async (id: string): Promise<boolean> => {
    const headers = await obtenerHeaders();
    const respuesta = await fetch(`${BASE_URL}/yo/favoritos/${id}`, {
      method: 'PUT',
      headers,
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error(` [ERROR PUT FAVORITOS ${respuesta.status}]:`, detalle);
      throw new Error('Error al agregar favorito');
    }
    return true;
  },

  
  eliminarFavorito: async (id: string): Promise<boolean> => {
    const headers = await obtenerHeaders();
    const respuesta = await fetch(`${BASE_URL}/yo/favoritos/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error(` [ERROR DELETE FAVORITOS ${respuesta.status}]:`, detalle);
      throw new Error('Error al eliminar favorito');
    }
    return true;
  }
};