// src/servicios/auth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { BASE_URL } from '../config/api';

export const authService = {
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
      throw error; 
    }
  },

  obtenerToken: async () => {
    return await SecureStore.getItemAsync('token_sesion');
  },

  cerrarSesion: async () => {
    await SecureStore.deleteItemAsync('token_sesion');
  },

  //  BIOMETRÍA 
  autenticarConBiometria: async (): Promise<boolean> => {
    try {
      const token = await SecureStore.getItemAsync('token_sesion');
      if (!token) return false; 

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Ingresar a Mi Ciudad Colón',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      return success;
    } catch (error) {
      console.error('Error al autenticar con biometría:', error);
      return false;
    }
  },
  
 
    esBiometriaSoportada: async (): Promise<boolean> => {
    const tieneHardware = await LocalAuthentication.hasHardwareAsync();
    const tieneBiometriaConfigurada = await LocalAuthentication.isEnrolledAsync();
    console.log('BIOMETRÍA → lector:', tieneHardware, '| huella registrada:', tieneBiometriaConfigurada); 
    return tieneHardware && tieneBiometriaConfigurada;
  }
};