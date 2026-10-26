// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { categoriasServicio } from '../../src/servicios/categoria';
import { lugaresServicio } from '../../src/servicios/lugares';
import { Categoria } from '../../src/tipos/categorias';
import { Lugar } from '../../src/tipos/lugares';

export default function PantallaInicio() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [categoriasFavoritas, setCategoriasFavoritas] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      const cargarDatosYPreferencias = async () => {
        setCargando(true);
        try {
          // 1. Cargamos las preferencias del usuario logueado desde SecureStore
          const infoStr = await SecureStore.getItemAsync('usuario_info');
          if (infoStr && !cancelado) {
            const usuario = JSON.parse(infoStr);
            if (usuario.preferencias?.categoriasFavoritas) {
              setCategoriasFavoritas(usuario.preferencias.categoriasFavoritas);
              // Si el usuario tiene una categoría favorita principal, la podemos dejar preseleccionada opcionalmente
              if (usuario.preferencias.categoriasFavoritas.length > 0 && !categoriaSeleccionada) {
                // Descomentá la línea de abajo si querés que filtre por su primera categoría favorita por defecto:
                // setCategoriaSeleccionada(usuario.preferencias.categoriasFavoritas[0]);
              }
            }
          }

          // 2. Cargamos lugares y categorías del servidor
          const [resLugares, resCategorias] = await Promise.all([
            lugaresServicio.obtenerLugares(),
            categoriasServicio.obtenerCategorias(),
          ]);

          if (!cancelado) {
            setLugares(resLugares.datos || []);
            setCategorias(resCategorias.datos || []);
          }
        } catch (error) {
          console.log('Error al cargar datos:', error);
        } finally {
          if (!cancelado) setCargando(false);
        }
      };

      cargarDatosYPreferencias();
      return () => { cancelado = true; };
    }, [])
  );

  const lugaresFiltrados = useMemo(() => {
    return lugares.filter((lugar) => {
      const coincideTexto = lugar.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = !categoriaSeleccionada || lugar.categoriaId === categoriaSeleccionada;
      return coincideTexto && coincideCategoria;
    });
  }, [lugares, busqueda, categoriaSeleccionada]);

  const obtenerLat = (l: Lugar) => Number(String(l.coordenadas?.latitud ?? (l.coordenadas as any)?.lat ?? '-32.2230').replace(',', '.'));
  const obtenerLng = (l: Lugar) => Number(String(l.coordenadas?.longitud ?? (l.coordenadas as any)?.lng ?? '-58.1415').replace(',', '.'));

  const marcadoresJS = lugaresFiltrados.map(lugar => 
    `L.marker([${obtenerLat(lugar)}, ${obtenerLng(lugar)}]).addTo(map).bindPopup("<b>${lugar.nombre}</b>");`
  ).join('\n');

  const htmlMapaMultiplesPines = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: #E5E7EB; }
          #map { width: 100vw; height: 100vh; }
          .leaflet-control-attribution { display: none; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([-32.2244, -58.1443], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          ${marcadoresJS}
        </script>
      </body>
    </html>
  `;

  // Función para manejar el botón de usuario (cierra sesión y vuelve al login)
  const manejarAccionUsuario = async () => {
    try {
      await SecureStore.deleteItemAsync('token_sesion');
      await SecureStore.deleteItemAsync('usuario_info');
      router.replace('/login' as any);
    } catch (error) {
      router.replace('/login' as any);
    }
  };

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <View style={estilos.header}>
        <Text style={estilos.tituloHeader}>Colón</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable style={estilos.botonQR} onPress={() => router.push('/escaner')}>
            <Ionicons name="qr-code-outline" size={20} color="#0B5394" />
            <Text style={estilos.textoBotonQR}>QR</Text>
          </Pressable>

          <Pressable 
            style={[estilos.botonQR, { paddingHorizontal: 8 }]} 
            onPress={manejarAccionUsuario}
          >
            <Ionicons name="person-outline" size={20} color="#0B5394" />
          </Pressable>
        </View>
      </View>

      <View style={estilos.contenedorBuscador}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={estilos.iconoBuscador} />
        <TextInput
          style={estilos.inputBuscador}
          placeholder="Buscar lugar por nombre"
          placeholderTextColor="#9CA3AF"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <Pressable onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      <View style={estilos.contenedorCategorias}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.scrollCategorias}>
          <Pressable
            style={[estilos.chipCategoria, !categoriaSeleccionada && estilos.chipCategoriaActiva]}
            onPress={() => setCategoriaSeleccionada(null)}
          >
            <Text style={[estilos.textoChip, !categoriaSeleccionada && estilos.textoChipActivo]}>Todas</Text>
          </Pressable>
          {categorias.map((cat) => {
            const activa = categoriaSeleccionada === cat.id;
            const esFavoritaUsuario = categoriasFavoritas.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[
                  estilos.chipCategoria, 
                  activa && estilos.chipCategoriaActiva,
                  // Opcional: Resaltar visualmente si es categoría favorita del usuario logueado
                  esFavoritaUsuario && !activa && { borderColor: '#0B5394', borderWidth: 2 }
                ]}
                onPress={() => setCategoriaSeleccionada(activa ? null : cat.id)}
              >
                <Text style={[estilos.textoChip, activa && estilos.textoChipActivo]}>
                  {cat.nombre} {esFavoritaUsuario ? '⭐' : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={estilos.contenedorMapa}>
        <WebView
          source={{ html: htmlMapaMultiplesPines }}
          style={estilos.mapa}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={estilos.headerLista}>
        <Text style={estilos.tituloLista}>Lugares ({lugaresFiltrados.length})</Text>
      </View>

      {cargando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#0B5394" />
        </View>
      ) : (
        <FlatList
          data={lugaresFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.listaLugares}
          renderItem={({ item }) => (
            <Pressable style={estilos.tarjetaLugar} onPress={() => router.push(`/lugares/${item.id}` as any)}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombreLugar}>{item.nombre}</Text>
                <Text style={estilos.direccionLugar} numberOfLines={1}>
                  {item.direccion || item.descripcionCorta}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#0B5394" />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  tituloHeader: { fontSize: 26, fontWeight: 'bold', color: '#0B5394' },
  botonQR: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EBF3FB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  textoBotonQR: { color: '#0B5394', fontWeight: 'bold', fontSize: 14 },
  contenedorBuscador: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 8, paddingHorizontal: 12, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  iconoBuscador: { marginRight: 8 },
  inputBuscador: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  contenedorCategorias: { marginVertical: 6 },
  scrollCategorias: { paddingHorizontal: 16, gap: 8 },
  chipCategoria: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  chipCategoriaActiva: { backgroundColor: '#0B5394', borderColor: '#0B5394' },
  textoChip: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  textoChipActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  contenedorMapa: { height: 200, marginHorizontal: 16, marginVertical: 10, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#E5E7EB' },
  mapa: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  headerLista: { paddingHorizontal: 16, marginTop: 6, marginBottom: 8 },
  tituloLista: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  listaLugares: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  tarjetaLugar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  nombreLugar: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  direccionLugar: { fontSize: 13, color: '#5C6B7A', marginTop: 2 },
});