import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.4:3000';

async function obtenerHeaders() {
  const token = await SecureStore.getItemAsync('token_sesion');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const usuarioServicio = {
  // POST /auth/registro - Crear una cuenta de turista
  registrarTurista: async (nombre: string, email: string, contrasena: string) => {
    const respuesta = await fetch(`${BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, contrasena }),
    });
    return await respuesta.json();
  },

  // GET /yo - Obtener los datos del usuario actual y sus preferencias
  obtenerMiUsuario: async () => {
    const headers = await obtenerHeaders();
    const respuesta = await fetch(`${BASE_URL}/yo`, {
      method: 'GET',
      headers,
    });
    return await respuesta.json();
  },

  // PATCH /yo - Cambiar nombre, foto o preferencias
  actualizarPerfil: async (nuevosDatos: { nombre?: string; avatarUrl?: string; preferencias?: any }) => {
    const headers = await obtenerHeaders();
    const respuesta = await fetch(`${BASE_URL}/yo`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(nuevosDatos),
    });
    return await respuesta.json();
  },
};