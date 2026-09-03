// app/(tabs)/index.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lugaresServicio } from '../src/servicios/lugares';
import { Lugar } from '../src/tipos/lugares';

export default function Inicio() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //useEffect: Se ejecuta una sola vez al montar la pantalla para buscar los datos
  useEffect(() => {
    const cargarLugares = async () => {
      try {
        const respuesta = await lugaresServicio.obtenerLugares();
        setLugares(respuesta.datos);
      } catch (err) {
        setError("No se pudieron cargar los datos de Colón.");
      } finally {
        setCargando(false);
      }
    };

    cargarLugares();
  }, []);

  if (cargando) {
    return (
      <SafeAreaView style={[estilos.contenedor, estilos.centrado]} edges={['top']}>
        <ActivityIndicator size="large" color="#0B5394" />
        <Text style={estilos.textoMensaje}>Cargando Guía de Colón...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[estilos.contenedor, estilos.centrado]} edges={['top']}>
        <Text style={estilos.textoError}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      
      {/* 1. BARRA SUPERIOR (Título + Botón [ Q ] para QR) */}
      <View style={estilos.barraSuperior}>
        <Text style={estilos.tituloApp}>Colón</Text>
      <Pressable 
  style={estilos.botonQr} 
  onPress={() => router.push('/escaner')}
  accessibilityLabel="Escanear código QR"
  role="button"
>
  <Ionicons name="qr-code-outline" size={22} color="#0B5394" />
  <Text style={estilos.textoQr}> Q </Text>
</Pressable>
      </View>

      {/* 2. ZONA DE MAPA (Simulada hasta integrar react-native-maps) */}
      <View style={estilos.contenedorMapa}>
        <View style={estilos.cajaMapaSimulado}>
          <Ionicons name="map" size={40} color="#8E99A4" />
          <Text style={estilos.textoMapa}>MAPA con marcadores</Text>
          <Text style={estilos.subtextoMapa}>(o) vos estás acá</Text>
        </View>
      </View>

      {/* 3. SECCIÓN "CERCA TUYO" (Lista ordenada por distancia) */}
      <View style={estilos.seccionCercanos}>
        <Text style={estilos.tituloSeccion}>Cerca tuyo</Text>
        
        <FlatList
          data={lugares}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={estilos.tarjetaCercana}>
              <View>
                <Text style={estilos.nombreLugar}>{item.nombre}</Text>
                <Text style={estilos.descripcionCorta} numberOfLines={1}>
                  {item.descripcionCorta}
                </Text>
              </View>
              {/* Distancia simulada para cumplir con el boceto */}
              <Text style={estilos.distancia}>900 m</Text>
            </View>
          )}
          contentContainerStyle={estilos.listaCercanos}
          ListEmptyComponent={<Text style={estilos.textoMensaje}>No hay lugares cercanos.</Text>}
        />
      </View>

    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centrado: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  barraSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tituloApp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B5394',
  },
  botonQr: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textoQr: {
    fontWeight: 'bold',
    color: '#0B5394',
    marginLeft: 4,
  },
  contenedorMapa: {
    height: 220, // Altura fija para el mapa en la pantalla principal
    padding: 16,
  },
  cajaMapaSimulado: {
    flex: 1,
    backgroundColor: '#E3E6EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  textoMapa: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 8,
  },
  subtextoMapa: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  seccionCercanos: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  listaCercanos: {
    gap: 8,
    paddingBottom: 16,
  },
  tarjetaCercana: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  nombreLugar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  descripcionCorta: {
    fontSize: 13,
    color: '#5C6B7A',
    maxWidth: 220,
  },
  distancia: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B5394',
  },
  textoMensaje: {
    fontSize: 14,
    color: '#5C6B7A',
    textAlign: 'center',
    marginTop: 10,
  },
  textoError: {
    fontSize: 16,
    color: '#D32F2F',
  },
});