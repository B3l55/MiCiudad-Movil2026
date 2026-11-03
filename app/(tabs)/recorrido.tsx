// app/(tabs)/recorrido.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Storage from 'expo-sqlite/kv-store'; 
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'; 
import { lugaresServicio } from '../../src/servicios/lugares';
import { visitasServicio } from '../../src/servicios/visitas';

const CLAVE_OCULTAS = 'visitas_ocultas'; 

export default function PantallaRecorrido() {
  const [visitas, setVisitas] = useState<any[]>([]);
  const [ocultas, setOcultas] = useState<string[]>([]); 
  const [nombresLugares, setNombresLugares] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarRecorrido = async () => {
        setCargando(true);
        try {
          //  ids que el usuario ocultó en este teléfono
          const guardadas = await Storage.getItem(CLAVE_OCULTAS);
          if (activo) setOcultas(guardadas ? JSON.parse(guardadas) : []);

          const datos = await visitasServicio.obtenerVisitas();
          if (activo) {
            setVisitas(Array.isArray(datos) ? datos : []);
          }

          try {
            const resLugares = await lugaresServicio.obtenerLugares();
            const mapa: Record<string, string> = {};
            (resLugares.datos || []).forEach((l: any) => { mapa[l.id] = l.nombre; });
            if (activo) setNombresLugares(mapa);
          } catch {
            // si falla, se muestra "Lugar visitado" como antes
          }
        } catch (error) {
          console.error('Error al cargar visitas:', error);
          if (activo) setVisitas([]);
        } finally {
          if (activo) setCargando(false);
        }
      };

      cargarRecorrido();
      return () => { activo = false; };
    }, [])
  );

  //  Pregunta antes de ocultar y guarda el id en el teléfono
  const confirmarOcultar = (idVisita: string) => {
    Alert.alert(
      'Quitar del recorrido',
      'La visita dejará de verse en este teléfono.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            const nuevas = [...ocultas, idVisita];
            setOcultas(nuevas);
            await Storage.setItem(CLAVE_OCULTAS, JSON.stringify(nuevas));
          },
        },
      ]
    );
  };

  //  Lo que realmente se muestra
  const visitasVisibles = visitas.filter((v) => !ocultas.includes(String(v.id || v._id)));

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Mi Recorrido</Text>

      {visitasVisibles.length === 0 ? ( 
        <View style={estilos.estadoVacio}>
          <Ionicons name="map-outline" size={64} color="#9CA3AF" />
          <Text style={estilos.textoVacio}>Tu recorrido está vacío.</Text>
          <Text style={estilos.subtextoVacio}>
            Cuando escanees el QR de un lugar y registres tu visita, aparecerá acá.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visitasVisibles} 
          keyExtractor={(item) => String(item.id || item._id || Math.random())}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable
              style={estilos.tarjeta}
              onPress={() => item.lugarId && router.push(`/lugares/${item.lugarId}` as any)}
            >
              <View style={estilos.iconoContainer}>
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              </View>
              <View style={estilos.infoTarjeta}>
                <Text style={estilos.nombreLugar}>
                  {item.lugar?.nombre || nombresLugares[item.lugarId] || 'Lugar visitado'}
                </Text>
                <Text style={estilos.fecha}>
                  {item.fechaHora || item.creadoEn || item.fecha ? new Date(item.fechaHora || item.creadoEn || item.fecha).toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                  }) : ''}
                </Text>
                {item.fotoUri && (
                  <Image source={{ uri: item.fotoUri }} style={estilos.foto} />
                )}
                {item.nota && (
                  <View style={estilos.notaContainer}>
                    <Text style={estilos.nota}>"{item.nota}"</Text>
                  </View>
                )}
              </View>
              {/*  botón de quitar */}
              <Pressable
                style={estilos.botonQuitar}
                onPress={() => confirmarOcultar(String(item.id || item._id))}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={22} color="#D32F2F" />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 40, paddingHorizontal: 16 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#0B5394', marginBottom: 20 },
  estadoVacio: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  textoVacio: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginTop: 16, textAlign: 'center' },
  subtextoVacio: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  lista: { paddingBottom: 24, gap: 12 },
  tarjeta: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  iconoContainer: { marginRight: 12, justifyContent: 'center' },
  infoTarjeta: { flex: 1, justifyContent: 'center' },
  nombreLugar: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  fecha: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  foto: { width: '100%', height: 150, borderRadius: 8, marginBottom: 6, backgroundColor: '#E5E7EB' },
  notaContainer: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, marginTop: 4 },
  nota: { fontSize: 14, color: '#4B5563', fontStyle: 'italic' },
  botonQuitar: { alignSelf: 'center', padding: 6, marginLeft: 8 }, 
});