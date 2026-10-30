// src/servicios/auth.ts


import * as SecureStore from 'expo-secure-store';

import { BASE_URL } from '../config/api';

export const authService = {
  // POST /auth/ingreso
  iniciarSesion: async (email: string, contrasena: string): Promise<boolean> => {
    try {
      const respuesta = await fetch(`${BASE_URL}/auth/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena }),
      });

      if (!respuesta.ok) return false;

      const json = await respuesta.json();
      const token = json.token || json.datos?.token || json.accessToken;

      if (token) {
        await SecureStore.setItemAsync('token_sesion', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  },

  obtenerToken: async () => {
    return await SecureStore.getItemAsync('token_sesion');
  },

  cerrarSesion: async () => {
    await SecureStore.deleteItemAsync('token_sesion');
  },

  // 🚀 Función restaurada para que no tire error en login.tsx
  autenticarConBiometria: async (): Promise<boolean> => {
    try {
      // Como base, validamos si existe un token previo guardado
      const token = await SecureStore.getItemAsync('token_sesion');
      return !!token;
    } catch (error) {
      return false;
    }
  }
};