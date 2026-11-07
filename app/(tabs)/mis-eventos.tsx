// app/(tabs)/mis-eventos.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { eventosGuardadosServicio } from '../../src/servicios/eventosGuardados';

export default function MisEventos() {
  //  Inicializamos explícitamente con un array vacío [] para que NUNCA sea undefined
  const [eventosGuardados, setEventosGuardados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // useFocusEffect recarga la lista automáticamente cada vez que entrás a esta pestaña
  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarEventos = async () => {
        setCargando(true);
        try {
          const respuesta = await eventosGuardadosServicio.obtenerGuardados();
          
          if (activo) {
            
            setEventosGuardados(Array.isArray(respuesta) ? respuesta : []);
          }
        } catch (error) {
          console.error('Error en UI al cargar eventos guardados:', error);
          if (activo) setEventosGuardados([]); 
        } finally {
          if (activo) setCargando(false);
        }
      };

      cargarEventos();

      return () => { activo = false; };
    }, [])
  );

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Mis Eventos Guardados</Text>

      {eventosGuardados.length === 0 ? (
        <View style={estilos.estadoVacio}>
          <Ionicons name="bookmark-outline" size={64} color="#9CA3AF" />
          <Text style={estilos.textoVacio}>No tenés eventos guardados todavía.</Text>
          <Text style={estilos.subtextoVacio}>
            Explorá la agenda y tocá el ícono de guardado para que aparezcan acá.
          </Text>
        </View>
      ) : (
     <FlatList
          data={eventosGuardados}
          keyExtractor={(item) => String(item.id || item.eventoId || Math.random())}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable 
              style={estilos.tarjeta} 
              onPress={() => router.push(`/eventos/${item.id || item.eventoId}` as any)}
            >
              <View style={estilos.infoTarjeta}>
                {/*   Lee el título o el nombre */}
                <Text style={estilos.nombreEvento}>
                  {item.titulo || item.nombre || 'Evento sin título'}
                </Text>
                
                {item.inicio && (
                  <Text style={estilos.fechaEvento}>
                    {new Date(item.inicio).toLocaleDateString('es-AR', {
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                )}
                <Text style={estilos.estadoEvento}>
                  Estado: {item.estado || 'Programado'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#0B5394" />
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
  subtextoVacio: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  lista: { paddingBottom: 24, gap: 12 },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoTarjeta: { flex: 1 },
  nombreEvento: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  fechaEvento: { fontSize: 14, color: '#0B5394', fontWeight: '500', marginBottom: 4 },
  estadoEvento: { fontSize: 13, color: '#6B7280', textTransform: 'capitalize' },
});