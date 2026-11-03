// src/hooks/useUbicacion.ts
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { Coordenadas } from '../tipos/lugares';

export type EstadoPermiso = 'cargando' | 'concedido' | 'denegado';

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [permiso, setPermiso] = useState<EstadoPermiso>('cargando');

  const obtenerPosicion = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermiso('denegado');
        setUbicacion(null);
        return;
      }
      setPermiso('concedido');

      
      const ultima = await Location.getLastKnownPositionAsync();
      if (ultima) {
        setUbicacion({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
      }
      const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUbicacion({ latitud: actual.coords.latitude, longitud: actual.coords.longitude });
    } catch (error) {
      // GPS apagado o sin señal: la app sigue funcionando sin el punto del usuario
      console.log('No se pudo obtener la ubicación:', error);
    }
  }, []);

  useEffect(() => {
    obtenerPosicion();
  }, [obtenerPosicion]);

  return { ubicacion, permiso, reintentar: obtenerPosicion };
}