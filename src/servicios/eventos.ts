// src/servicios/eventos.ts
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../config/api';

export const eventosServicio = {
  // GET /eventos (Trae eventos desde hoy en adelante)
  obtenerEventos: async () => {
    const respuesta = await fetch(`${BASE_URL}/eventos`);
    if (!respuesta.ok) throw new Error('Error al obtener la lista de eventos');
    const json = await respuesta.json();
    return json.datos || json;
  },

  // GET /eventos/:id (Detalle)
  obtenerEventoPorId: async (id: string) => {
    const respuesta = await fetch(`${BASE_URL}/eventos/${id}`);
    if (!respuesta.ok) throw new Error('Error al obtener el evento');
    const json = await respuesta.json();
    return json.datos || json;
  },

  // 🚀 NUEVO: PATCH /eventos/:id -> Cambia el estado (requiere ser admin)
  actualizarEstado: async (id: string, nuevoEstado: 'suspendido' | 'cancelado') => {
    const token = await SecureStore.getItemAsync('token_sesion');
    const respuesta = await fetch(`${BASE_URL}/eventos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!respuesta.ok) throw new Error('Error al cambiar el estado del evento');
    return await respuesta.json();
  }
};