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

  // PATCH /eventos/:id/estado -> suspender, cancelar o reprogramar (solo cuenta de Turismo)
  actualizarEstado: async (id: string, nuevoEstado: 'programado' | 'suspendido' | 'cancelado') => {
    const token = await SecureStore.getItemAsync('token_sesion');
    const respuesta = await fetch(`${BASE_URL}/eventos/${id}/estado`, { 
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!respuesta.ok) {
      //  La API responde { error: { codigo, mensaje } }: mostramos el mensaje real
      const cuerpo = await respuesta.json().catch(() => null);
      console.log('Error al cambiar estado →', respuesta.status, JSON.stringify(cuerpo));
      throw new Error(`(${respuesta.status}) ${cuerpo?.error?.mensaje ?? 'Error al cambiar el estado del evento'}`);
    }
    return await respuesta.json();
  },
};