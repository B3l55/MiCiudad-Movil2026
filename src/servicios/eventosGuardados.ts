// src/servicios/eventosGuardados.ts
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../config/api';


let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.warn('expo-notifications no está disponible en este contenedor de Expo Go');
}

async function obtenerHeaders() {
  const token = await SecureStore.getItemAsync('token_sesion');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const eventosGuardadosServicio = {
  
  obtenerGuardados: async (): Promise<any[]> => {
    try {
      const headers = await obtenerHeaders();
      const respuesta = await fetch(`${BASE_URL}/yo/eventos-guardados`, {
        method: 'GET',
        headers,
      });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();
      const lista = json.datos || json;
      return Array.isArray(lista) ? lista : [];
    } catch (error) {
      console.error('Error al obtener guardados:', error);
      return [];
    }
  },

  esGuardado: async (id: string): Promise<boolean> => {
    const guardados = await eventosGuardadosServicio.obtenerGuardados();
    return guardados.some((item: any) => {
      const itemID = item.id || item.eventoId || item._id || item;
      return String(itemID) === String(id);
    });
  },

  
  alternarGuardado: async (id: string): Promise<boolean> => {
    try {
      const guardadoActualmente = await eventosGuardadosServicio.esGuardado(id);
      const headers = await obtenerHeaders();

      if (guardadoActualmente) {
        const respuesta = await fetch(`${BASE_URL}/yo/eventos-guardados/${id}`, {
          method: 'DELETE',
          headers,
        });
        if (!respuesta.ok) throw new Error('Error al quitar de guardados');
        return false;
      } else {
        const respuesta = await fetch(`${BASE_URL}/yo/eventos-guardados/${id}`, {
          method: 'PUT',
          headers,
        });

        if (!respuesta.ok) {
          const errJson = await respuesta.json().catch(() => ({}));
          throw new Error(errJson.mensaje || 'No se puede guardar este evento.');
        }
        return true;
      }
    } catch (error) {
      console.error('Error al guardar/eliminar evento:', error);
      throw error;
    }
  }
};

export const programarAvisoEvento = async (titulo: string, fechaInicio: string) => {
  if (!Notifications || typeof Notifications.requestPermissionsAsync !== 'function') {
    return;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const fechaAlerta = new Date(fechaInicio);
    fechaAlerta.setMinutes(fechaAlerta.getMinutes() - 30);

    if (fechaAlerta.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Tu evento está por empezar!',
          body: `${titulo} arranca en 30 minutos.`,
          sound: true,
        },
        trigger: { date: fechaAlerta, type: 'calendar' } as any,
      });
    }
  } catch (err) {
    console.warn('Error al programar la notificación:', err);
  }
};