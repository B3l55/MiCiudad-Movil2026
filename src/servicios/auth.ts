// src/servicios/auth.ts
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.4:3000'; 

export const authService = {
  obtenerToken: async () => {
    try {
      return await SecureStore.getItemAsync('token_sesion');
    } catch (error) {
      return null;
    }
  },

  iniciarSesion: async (correo: string, contrasena: string): Promise<boolean> => {
    try {
      console.log("Enviando credenciales para:", correo.trim());

const respuesta = await fetch(`${BASE_URL}/auth/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: correo.trim(), 
          contrasena: contrasena 
        })
      });

      const datos = await respuesta.json();
      console.log("Respuesta completa del servidor:", datos);

      if (!respuesta.ok) {
        return false;
      }
      
      // Buscamos el token en las distintas formas comunes que devuelven las APIs
      const token = datos.datos?.token || datos.token || datos.access_token;
      const usuarioInfo = datos.datos?.usuario || datos.datos;

      if (token) {
        await SecureStore.setItemAsync('token_sesion', token);
      // Guardamos también la info del usuario en formato JSON para leerla en las pantallas
  if (usuarioInfo) {
    await SecureStore.setItemAsync('usuario_info', JSON.stringify(usuarioInfo));
  }
  return true;
}
      
      return false;
    } catch (error) {
      console.error("Error al conectar con la API de login:", error);
      return false;
    }
  },

  autenticarConBiometria: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('token_sesion');
    return token !== null;
  },

  cerrarSesion: async () => {
    try {
      await SecureStore.deleteItemAsync('token_sesion');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }
};