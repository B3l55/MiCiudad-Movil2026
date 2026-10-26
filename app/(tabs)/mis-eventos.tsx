// app/(tabs)/mis-eventos.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { eventosServicio } from '../../src/servicios/eventos';
import { eventosGuardadosServicio } from '../../src/servicios/eventosGuardados';
import { Evento } from '../../src/tipos/eventos';
import { formatearHora } from '../../src/utilidades/fechas';

export default function MisEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      const cargarGuardados = async () => {
        setCargando(true);
        try {
          const [respuesta, idsGuardados] = await Promise.all([
            eventosServicio.obtenerEventos(),
            eventosGuardadosServicio.obtenerGuardados(),
          ]);

          if (!cancelado) {
            const guardados = respuesta.datos.filter(evento => idsGuardados.includes(evento.id));
            setEventos(guardados);
          }
        } catch (error) {
          console.log('Error al cargar eventos guardados:', error);
        } finally {
          if (!cancelado) setCargando(false);
        }
      };

      cargarGuardados();
      return () => { cancelado = true; };
    }, [])
  );

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <View style={estilos.header}>
        <Text style={estilos.tituloHeader}>Mi Agenda</Text>
      </View>

      {cargando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#0B5394" />
        </View>
      ) : eventos.length === 0 ? (
        <View style={estilos.centradoVacio}>
          <Ionicons name="bookmark-outline" size={64} color="#C7C7CC" />
          <Text style={estilos.textoVacio}>No guardaste ningún evento</Text>
          <Text style={estilos.subtextoVacio}>Explorá la agenda y guardá los que te interesen.</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable
              style={estilos.tarjeta}
              onPress={() => router.push(`/eventos/${item.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={estilos.titulo} numberOfLines={2}>{item.titulo}</Text>
                <View style={estilos.filaDato}>
                  <Ionicons name="time-outline" size={16} color="#0B5394" />
                  <Text style={estilos.textoDato}>{formatearHora(item.inicio)} hs</Text>
                </View>
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
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  tituloHeader: { fontSize: 22, fontWeight: 'bold', color: '#0B5394' },
  lista: { padding: 16, gap: 12 },
  tarjeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 6 },
  filaDato: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoDato: { fontSize: 14, color: '#4B5563' },
  centradoVacio: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  textoVacio: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginTop: 16, textAlign: 'center' },
  subtextoVacio: { fontSize: 14, color: '#5C6B7A', marginTop: 8, textAlign: 'center' },
});