// src/servicios/auth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const CLAVE_TOKEN = 'mi_ciudad_token_sesion';

export const authService = {
  // 1. Iniciar sesión tradicional (simulado contra la API)
  iniciarSesion: async (correo: string, contrasena: string): Promise<boolean> => {
    // Simulamos la demora del servidor
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Hardcodeamos un usuario de prueba hasta que esté la API real
    if (correo === 'alumno@uner.edu.ar' && contrasena === '123456') {
      const tokenSimulado = 'abc-123-xyz-987';
      // Guardamos el token cifrado en el dispositivo
      await SecureStore.setItemAsync(CLAVE_TOKEN, tokenSimulado);
      return true;
    }
    return false;
  },

  // 2. Leer el token al arrancar la app
  obtenerToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(CLAVE_TOKEN);
  },

  // 3. Cerrar sesión borrando el rastro
  cerrarSesion: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  },

  // 4. Reingreso con Biometría (Huella/Rostro)
  autenticarConBiometria: async (): Promise<boolean> => {
    // Verificamos si el equipo tiene lector físico
    const hardwareCompatible = await LocalAuthentication.hasHardwareAsync();
    if (!hardwareCompatible) return false;

    // Verificamos si el usuario tiene registrada su huella o rostro en el celular
    const huellaRegistrada = await LocalAuthentication.isEnrolledAsync();
    if (!huellaRegistrada) return false;

    // Disparamos el cartel nativo del sistema operativo
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Reingresá a Mi Ciudad',
      fallbackLabel: 'Usar PIN o contraseña', // La alternativa exigida por el PRD
      cancelLabel: 'Cancelar',
    });

    return resultado.success;
  }
};