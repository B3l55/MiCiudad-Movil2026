// src/servicios/usuario.ts
import * as SecureStore from 'expo-secure-store';

import { BASE_URL } from '../config/api';

async function obtenerHeaders(esJson = true) {
  const token = await SecureStore.getItemAsync('token_sesion');
  const headers: any = {};
  if (esJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const usuarioServicio = {
  // GET /yo -> Obtener datos del usuario logueado
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
  actualizarPerfil: async (datos: { nombre?: string; foto?: string; preferencias?: any }) => {
    const headers = await obtenerHeaders(true);
    const respuesta = await fetch(`${BASE_URL}/yo`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(datos),
    });
    if (!respuesta.ok) {
      const error = await respuesta.text();
      throw new Error(`Error al actualizar perfil: ${error}`);
    }
    return await respuesta.json();
  },

  // POST /archivos
  subirFoto: async (uriImagen: string): Promise<string> => {
    const headers = await obtenerHeaders(false); 
    const nombreArchivo = uriImagen.split('/').pop() || 'foto.jpg';
    const match = /\.(\w+)$/.exec(nombreArchivo);
    const tipo = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append('archivo', {
      uri: uriImagen,
      name: nombreArchivo,
      type: tipo,
    } as any);

    const respuesta = await fetch(`${BASE_URL}/archivos`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!respuesta.ok) {
      const error = await respuesta.text();
      throw new Error(`Error al subir imagen: ${error}`);
    }
    
    const json = await respuesta.json();
    return json.datos?.clave || json.clave || json.url || json;
  }
};