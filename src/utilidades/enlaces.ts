// src/utilidades/enlaces.ts
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

const abrir = async (url: string, mensajeError: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No se pudo abrir', mensajeError);
  }
};

export const abrirRuta = (lat?: number, lng?: number, nombre?: string) => {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    Alert.alert('Ubicación no disponible', 'Este lugar no tiene coordenadas válidas registradas.');
    return;
  }

  router.push({
    pathname: '/como-llegar',
    params: {
      lat: lat.toString(),
      lng: lng.toString(),
      nombre: nombre || 'Lugar',
    },
  });
};

export const abrirMapaExterno = async (lat: number, lng: number, nombre?: string) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Error', 'No se pudo abrir la aplicación de mapas externa.');
  }
};

export const llamar = (telefono: string) =>
  abrir(`tel:${telefono.replace(/[^\d+]/g, '')}`, 'Este dispositivo no puede hacer llamadas.');

export const abrirWeb = (url: string) => abrir(url, 'No se pudo abrir el sitio web.');