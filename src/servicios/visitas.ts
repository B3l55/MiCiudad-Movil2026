// src/servicios/visitas.ts
import * as SecureStore from 'expo-secure-store';

import { BASE_URL } from '../config/api';

async function obtenerHeaders(esJson = true) {
  const token = await SecureStore.getItemAsync('token_sesion');
  const headers: any = {};
  if (esJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// La API responde los errores como { error: { codigo, mensaje } }
async function leerError(respuesta: Response, textoPorDefecto: string): Promise<Error> {
  const cuerpo = await respuesta.json().catch(() => null);
  console.log('Error de la API →', respuesta.status, JSON.stringify(cuerpo));
  return new Error(`(${respuesta.status}) ${cuerpo?.error?.mensaje ?? textoPorDefecto}`);
}

export const visitasServicio = {
  // GET /yo/visitas -> historial de lugares visitados
  obtenerVisitas: async (): Promise<any[]> => {
    try {
      const headers = await obtenerHeaders(true);
      const respuesta = await fetch(`${BASE_URL}/yo/visitas`, { method: 'GET', headers });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();
      const lista = json.datos || json;
      return Array.isArray(lista) ? lista : [];
    } catch (error) {
      console.error('Error al cargar recorrido:', error);
      return [];
    }
  },

  // POST /yo/visitas -> registra una visita a un lugar (nota y foto opcionales)
  registrarVisita: async (datos: {
    lugarId: string;
    origen: 'qr' | 'gps' | 'manual';
    nota?: string | null;
    fotoUri?: string | null;
  }) => {
    const headers = await obtenerHeaders(true);

    // El id lo genera la app: si se reintenta, la API responde "ya existía" y no duplica
    const cuerpo = {
      id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lugarId: datos.lugarId,
      fechaHora: new Date().toISOString(),
      origen: datos.origen,
      fotoUri: datos.fotoUri ?? null,
      nota: datos.nota ?? null,
      sincronizada: true,
    };
    console.log('POST visita →', JSON.stringify(cuerpo));

    const respuesta = await fetch(`${BASE_URL}/yo/visitas`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cuerpo),
    });

    if (!respuesta.ok) throw await leerError(respuesta, 'Error al registrar visita');
    return await respuesta.json();
  },

 // PATCH /yo/visitas/:id -> agrega nota y/o foto a una visita existente
  actualizarVisita: async (idVisita: string, datos: { nota?: string; foto?: string }) => {
    const headers = await obtenerHeaders(true);
    
    // Mapeamos al nombre exacto que usa la estructura del servidor (fotoUri y nota)
    const payloadLimpio = {
      nota: datos.nota,
      fotoUri: datos.foto, // 👈 Probamos con fotoUri según la estructura de la visita
    };

    const respuesta = await fetch(`${BASE_URL}/yo/visitas/${idVisita}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payloadLimpio),
    });

    if (!respuesta.ok) throw await leerError(respuesta, 'Error al actualizar la visita');
    return await respuesta.json();
  },
};