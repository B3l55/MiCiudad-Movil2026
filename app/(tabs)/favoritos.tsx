// app/(tabs)/favoritos.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { favoritosServicio } from '../../src/servicios/favoritos';
import { lugaresServicio } from '../../src/servicios/lugares';
import { Lugar } from '../../src/tipos/lugares';

export default function PantallaFavoritos() {
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      const cargarFavoritos = async () => {
        setCargando(true);
        try {
          const ids = await favoritosServicio.obtenerFavoritosIds();
          console.log('IDs de Favoritos traídos de la API:', ids);
          const respuesta = await lugaresServicio.obtenerLugares();
          
          if (!cancelado) {
            const lugaresFavs = (respuesta.datos || []).filter(lugar => ids.includes(lugar.id));
            setFavoritos(lugaresFavs);
          }
        } catch (error) {
          console.log('Error al cargar favoritos:', error);
        } finally {
          if (!cancelado) setCargando(false);
        }
      };

      cargarFavoritos();
      return () => { cancelado = true; };
    }, [])
  );

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <View style={estilos.barraSuperior}>
        <Text style={estilos.tituloApp}>Mis Favoritos</Text>
      </View>

      {cargando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#0B5394" />
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable 
              style={estilos.tarjeta}
              onPress={() => router.push(`/lugares/${item.id}` as any)}
            >
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombreLugar}>{item.nombre}</Text>
                <Text style={estilos.descripcion} numberOfLines={1}>
                  {item.descripcionCorta || item.direccion}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#0B5394" />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={estilos.centradoVacio}>
              <Ionicons name="heart-dislike-outline" size={48} color="#9CA3AF" />
              <Text style={estilos.textoVacio}>No tenés lugares guardados en favoritos todavía.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  barraSuperior: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  tituloApp: { fontSize: 22, fontWeight: 'bold', color: '#0B5394' },
  lista: { padding: 16, gap: 12 },
  tarjeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  nombreLugar: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  descripcion: { fontSize: 13, color: '#5C6B7A' },
  centradoVacio: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 32 },
  textoVacio: { marginTop: 12, textAlign: 'center', color: '#6B7280', fontSize: 15, lineHeight: 22 },
});