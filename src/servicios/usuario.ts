// src/servicios/usuario.ts
import { File } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { fetch as fetchExpo } from 'expo/fetch';

import { BASE_URL } from '../config/api';

async function obtenerHeaders(esJson = true) {
  const token = await SecureStore.getItemAsync('token_sesion');
  const headers: any = {};
  if (esJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}


async function leerError(respuesta: Response, textoPorDefecto: string): Promise<Error> {
  const cuerpo = await respuesta.json().catch(() => null);
  console.log('Error de la API →', respuesta.status, JSON.stringify(cuerpo));
  return new Error(`(${respuesta.status}) ${cuerpo?.error?.mensaje ?? textoPorDefecto}`);
}

export const usuarioServicio = {
  // GET /yo 
  obtenerPerfil: async () => {
    const headers = await obtenerHeaders(true);
    const respuesta = await fetch(`${BASE_URL}/yo`, {
      method: 'GET',
      headers,
    });
    if (!respuesta.ok) throw new Error('Error al obtener perfil');
    const json = await respuesta.json();
    return json.datos || json;
  },

  // POST /auth/registro
  registrar: async (datos: { nombre: string; email: string; clave: string }) => {
    const respuesta = await fetch(`${BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: datos.nombre,
        email: datos.email,
        contrasena: datos.clave
      }),
    });

    if (!respuesta.ok) {
      const error = await respuesta.text();
      throw new Error(`Error en registro: ${error}`);
    }
    return await respuesta.json();
  },

  // PATCH /yo
  actualizarPerfil: async (datos: { nombre?: string; avatarUrl?: string; preferencias?: any }) => { 
    const headers = await obtenerHeaders(true);
    const respuesta = await fetch(`${BASE_URL}/yo`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(datos),
    });
    if (!respuesta.ok) throw await leerError(respuesta, 'Error al actualizar el perfil'); 
    return await respuesta.json();
  },

 
  subirFoto: async (uriImagen: string): Promise<string> => {
    
    const formData = new FormData();
    formData.append('archivo', new File(uriImagen));

    const token = await SecureStore.getItemAsync('token_sesion');
    const respuesta = await fetchExpo(`${BASE_URL}/archivos`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        
        
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json: any = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      throw new Error(`(${respuesta.status}) ${json?.error?.mensaje ?? 'No se pudo subir la imagen'}`);
    }

  
    const url = json?.datos?.url ?? json?.datos?.clave;
    if (!url) throw new Error('El servidor no devolvió la dirección de la imagen.');
    return url;
  },
};