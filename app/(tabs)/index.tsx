import Ionicons from '@react-native-vector-icons/ionicons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import FiltroCategorias from '../../src/componentes/FiltroCategorias';
import { categoriasServicio } from '../../src/servicios/categoria';
import { lugaresServicio } from '../../src/servicios/lugares';
import { ErrorApi } from '../../src/tipos/api';
import { Categoria } from '../../src/tipos/categorias';
import { Lugar } from '../../src/tipos/lugares';

const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatearDistancia = (metros: number) => {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
};

// Abre la app de mapas del teléfono con la ruta hasta el lugar
const abrirMapaExterno = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.openURL(url);
};

export default function Inicio() {
  // ---- Estados (todos los hooks van arriba, antes de cualquier return) ----
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<Location.LocationObject | null>(null);

  // ---- Categorías: una sola vez ----
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await categoriasServicio.obtenerCategorias();
        setCategorias(respuesta.datos);
      } catch {
        // Sin categorías la app sigue funcionando, solo sin filtros
      }
    };
    cargarCategorias();
  }, []);

  // ---- Ubicación: una sola vez. Si se niega el permiso, la app sigue igual ----
  useEffect(() => {
    const obtenerUbicacion = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const serviciosEncendidos = await Location.hasServicesEnabledAsync();
        if (!serviciosEncendidos) return;

        const loc = await Location.getCurrentPositionAsync({});
        setUbicacion(loc);
      } catch (err) {
        console.log('Error al obtener ubicación:', err);
      }
    };
    obtenerUbicacion();
  }, []);

  // ---- Lugares: al inicio y cada vez que cambia la categoría elegida ----
  useEffect(() => {
    const cargarLugares = async () => {
      try {
        setError(null);
        const respuesta = await lugaresServicio.obtenerLugares({
          categoriaId: categoriaSeleccionada ?? undefined,
        });
        setLugares(respuesta.datos);
      } catch (err) {
        setLugares([]);
        setError(err instanceof ErrorApi ? err.message : 'No se pudieron cargar los datos de Colón.');
      } finally {
        setCargando(false);
      }
    };
    cargarLugares();
  }, [categoriaSeleccionada]);

  // ---- Derivados ----
  // id de categoría -> nombre, para mostrar "Termas" en vez de "cat-termas"
  const nombresCategorias = useMemo(() => {
    const mapa: Record<string, string> = {};
    categorias.forEach((c) => {
      mapa[c.id] = c.nombre;
    });
    return mapa;
  }, [categorias]);

  // Ordenados por distancia (si hay ubicación)
  const lugaresOrdenados = useMemo(() => {
    if (!ubicacion) return lugares;

    const distanciaA = (l: Lugar) =>
      calcularDistancia(
        ubicacion.coords.latitude,
        ubicacion.coords.longitude,
        l.coordenadas.latitud,
        l.coordenadas.longitud
      );

    return [...lugares].sort((a, b) => distanciaA(a) - distanciaA(b));
  }, [lugares, ubicacion]);

  // ---- Pantalla de carga (solo la primera vez) ----
  if (cargando) {
    return (
      <SafeAreaView style={[estilos.contenedor, estilos.centrado]} edges={['top']}>
        <ActivityIndicator size="large" color="#0B5394" />
        <Text style={estilos.textoMensaje}>Cargando Guía de Colón...</Text>
      </SafeAreaView>
    );
  }

  const textoVacio =
    error ??
    (categoriaSeleccionada ? 'No hay lugares en esta categoría.' : 'No hay lugares para mostrar.');

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <View style={estilos.barraSuperior}>
        <Text style={estilos.tituloApp}>Colón</Text>
        <Pressable style={estilos.botonQr} onPress={() => router.push('/escaner')}>
          <Ionicons name="qr-code-outline" size={22} color="#0B5394" />
          <Text style={estilos.textoQr}> QR </Text>
        </Pressable>
      </View>

      <FiltroCategorias
        categorias={categorias}
        seleccionada={categoriaSeleccionada}
        onSeleccionar={setCategoriaSeleccionada}
      />

      <View style={estilos.contenedorMapa}>
        <View style={estilos.mapaEnvoltura}>
          <MapView
            style={estilos.mapa}
            mapType="standard"
            showsUserLocation={true}
            initialRegion={{
              latitude: -32.2244,
              longitude: -58.1443,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {lugaresOrdenados.map((lugar) => (
              <Marker
                key={lugar.id}
                coordinate={{
                  latitude: lugar.coordenadas.latitud,
                  longitude: lugar.coordenadas.longitud,
                }}
                title={lugar.nombre}
                onCalloutPress={() =>
                  router.push({ pathname: '/lugares/[id]', params: { id: lugar.id } })
                }
              />
            ))}
          </MapView>
        </View>
      </View>

      <View style={estilos.seccionCercanos}>
        <Text style={estilos.tituloSeccion}>Lugares ({lugaresOrdenados.length})</Text>

        <FlatList
          data={lugaresOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let textoDistancia: string | null = null;
            if (ubicacion) {
              const metros = calcularDistancia(
                ubicacion.coords.latitude,
                ubicacion.coords.longitude,
                item.coordenadas.latitud,
                item.coordenadas.longitud
              );
              textoDistancia = `A ${formatearDistancia(metros)} de tu ubicación`;
            }

            return (
              <Pressable
                style={estilos.tarjetaCercana}
                onPress={() => router.push({ pathname: '/lugares/[id]', params: { id: item.id } })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nombreLugar} numberOfLines={2}>
                    {item.nombre}
                  </Text>
                  <Text style={estilos.descripcionCorta} numberOfLines={1}>
                    {nombresCategorias[item.categoriaId] ?? ''}
                  </Text>
                  {textoDistancia && <Text style={estilos.distancia}>{textoDistancia}</Text>}
                </View>

                <Pressable
                  style={estilos.botonRuta}
                  onPress={() =>
                    abrirMapaExterno(item.coordenadas.latitud, item.coordenadas.longitud)
                  }
                >
                  <Ionicons name="navigate-circle" size={32} color="#0B5394" />
                </Pressable>
              </Pressable>
            );
          }}
          contentContainerStyle={estilos.listaCercanos}
          ListEmptyComponent={<Text style={estilos.textoMensaje}>{textoVacio}</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  centrado: { justifyContent: 'center', alignItems: 'center' },
  barraSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  tituloApp: { fontSize: 22, fontWeight: 'bold', color: '#0B5394' },
  botonQr: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoQr: { fontWeight: 'bold', color: '#0B5394', marginLeft: 4 },
  contenedorMapa: { height: 220, padding: 16 },
  mapaEnvoltura: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  mapa: { width: '100%', height: '100%' },
  seccionCercanos: { flex: 1, paddingHorizontal: 16 },
  tituloSeccion: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  listaCercanos: { gap: 12, paddingBottom: 16 },
  tarjetaCercana: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  nombreLugar: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  descripcionCorta: { fontSize: 13, color: '#5C6B7A', marginBottom: 6 },
  distancia: { fontSize: 14, fontWeight: '600', color: '#0B5394' },
  botonRuta: { paddingLeft: 12 },
  textoMensaje: { fontSize: 14, color: '#5C6B7A', textAlign: 'center', marginTop: 10 },
});