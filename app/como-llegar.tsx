// app/como-llegar.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { abrirMapaExterno } from '../src/utilidades/enlaces';

export default function PantallaComoLlegar() {
  const { lat, lng, nombre } = useLocalSearchParams<{ lat?: string; lng?: string; nombre?: string }>();

  // Parseo seguro de coordenadas
  const latNum = parseFloat(lat ?? '-32.2244');
  const lngNum = parseFloat(lng ?? '-58.1443');

  // Generamos el HTML con el iframe web de Google Maps
  const mapaHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background-color: #E5E7EB; }
          iframe { width: 100%; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="https://maps.google.com/maps?q=${latNum},${lngNum}&t=m&z=16&output=embed&iwloc=near" 
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen
        options={{
          title: 'Cómo llegar',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={estilos.botonHeader}>
              <Ionicons name="arrow-back" size={24} color="#0B5394" />
            </Pressable>
          ),
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#0B5394',
        }}
      />

      {/* Contenedor del mapa web */}
      <View style={estilos.mapaContainer}>
        <WebView
          source={{ html: mapaHtml }}
          style={estilos.mapa}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={estilos.tarjetaInferior}>
        <Text style={estilos.tituloDestino}>{nombre ?? 'Lugar de interés'}</Text>

        <Pressable
          style={estilos.botonNavegarGoogle}
          onPress={() => abrirMapaExterno(latNum, lngNum, nombre)}
        >
          <Ionicons name="navigate-circle" size={22} color="#FFFFFF" />
          <Text style={estilos.textoBotonNavegar}>Abrir en Google Maps / GPS</Text>
        </Pressable>

        <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0B5394" />
          <Text style={estilos.textoBotonVolver}>Volver a la Guía</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  mapaContainer: { flex: 1, backgroundColor: '#E5E7EB' },
  mapa: { flex: 1, backgroundColor: 'transparent' },
  botonHeader: { paddingRight: 16 },
  tarjetaInferior: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  tituloDestino: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 6 },
  botonNavegarGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B5394',
    paddingVertical: 14,
    borderRadius: 12,
  },
  textoBotonNavegar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EBF3FB',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B9D5F0',
  },
  textoBotonVolver: { color: '#0B5394', fontWeight: 'bold', fontSize: 15 },
});