// src/componentes/MapaLugares.tsx
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Coordenadas, Lugar } from '../tipos/lugares';
import { distanciaMetros, formatearDistancia } from '../utilidades/distancia'; 

interface Props {
  lugares: Lugar[];
  ubicacionUsuario?: Coordenadas | null;
}

const REGION_POR_DEFECTO = {
  latitude: -32.2227,
  longitude: -58.1413,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function MapaLugares({ lugares, ubicacionUsuario }: Props) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  return (
    <View style={estilos.contenedor}>
      <MapView
        ref={mapRef}
        style={estilos.mapa}
        initialRegion={REGION_POR_DEFECTO}
        showsUserLocation={!!ubicacionUsuario}
        showsMyLocationButton={!!ubicacionUsuario}
      >
        {lugares.map((lugar) => {
          
          const latRaw = lugar.coordenadas?.latitud ?? (lugar.coordenadas as any)?.lat ?? lugar.latitud;
          const lngRaw = lugar.coordenadas?.longitud ?? (lugar.coordenadas as any)?.lng ?? lugar.longitud;

          const lat = Number(String(latRaw || '').replace(',', '.'));
          const lng = Number(String(lngRaw || '').replace(',', '.'));

          
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={lugar.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={lugar.nombre}
              
              description={
                ubicacionUsuario
                  ? `A ${formatearDistancia(distanciaMetros(ubicacionUsuario, { latitud: lat, longitud: lng }))} · tocá para ver más`
                  : lugar.direccion || 'Tocar para ver más detalles'
              }
              onCalloutPress={() => router.push(`/lugares/${lugar.id}` as any)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapa: {
    width: '100%',
    height: '100%',
  },
});