// app/lugares/[id].tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudioPlayer } from 'expo-audio'; // <--- NUEVO: Importamos el módulo oficial
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { lugaresServicio } from '../../src/servicios/lugares';
// import { Lugar } from '../../src/tipos/lugares'; NO VA
import { ErrorApi } from '../../src/tipos/api';
import { Audioguia, Lugar } from '../../src/tipos/lugares';

// ---> NUEVO: Componente reproductor separado <---
function ReproductorAudioguia({ audioguia }: { audioguia: Audioguia }) {
  // Inicializamos el reproductor con la URL del audio
  const player = useAudioPlayer(audioguia.url);

  const alternarReproduccion = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={estilos.cajaAudioguia}>
      <Pressable style={estilos.botonPlay} onPress={alternarReproduccion}>
        {/* Cambia el ícono de Play a Pausa automáticamente */}
        <Ionicons name={player.playing ? "pause" : "play"} size={24} color="#FFF" />
      </Pressable>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={estilos.textoAudioguiaTitulo}>Audioguía disponible</Text>
        <Text style={estilos.textoAudioguiaSub}>
          {player.playing ? "Reproduciendo..." : `Duración: ${Math.round(audioguia.duracionSegundos / 60)} min`}
        </Text>
      </View>
    </View>
  );
}

export default function DetalleLugar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const lugarEncontrado = await lugaresServicio.obtenerLugarPorId(id);
        setLugar(lugarEncontrado);
      } catch (err) {
        setError(err instanceof ErrorApi ? err.message : 'Ocurrió un error inesperado.');
      } finally {
        setCargando(false);
      }
    };
    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  if (error || !lugar) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <Text style={estilos.textoError}>{error ?? 'No se encontró la información del lugar.'}</Text>
        <Pressable style={estilos.botonVolverTexto} onPress={() => router.back()}>
          <Text style={estilos.textoBotonAzul}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={estilos.contenedorImagen}>
        <Image 
          source={{ uri: lugar.imagenes && lugar.imagenes.length > 0 ? lugar.imagenes[0] : 'https://via.placeholder.com/400x250?text=Sin+Imagen' }} 
          style={estilos.imagen} 
          resizeMode="cover"
        />
        <Pressable style={estilos.botonVolverFlotante} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView style={estilos.contenido} showsVerticalScrollIndicator={false}>
        
        <Text style={estilos.titulo}>{lugar.nombre}</Text>
        
        <View style={estilos.tarjetaInfo}>
          <View style={estilos.filaInfo}>
            <Ionicons name="location-outline" size={20} color="#5C6B7A" />
            <Text style={estilos.textoInfo}>{lugar.direccion || 'Dirección no disponible'}</Text>
          </View>
          
          <View style={estilos.filaInfo}>
            <Ionicons name="ticket-outline" size={20} color="#5C6B7A" />
            <Text style={estilos.textoInfo}>
              {lugar.precioEntrada === 0 ? 'Entrada gratuita' : lugar.precioEntrada ? `$${lugar.precioEntrada}` : 'Consultar precio'}
            </Text>
          </View>
        </View>

        {/* ---> NUEVO: Llamamos al componente reproductor si hay audio <--- */}
        {lugar.audioguia && <ReproductorAudioguia audioguia={lugar.audioguia} />}

        <Text style={estilos.subtitulo}>Sobre este lugar</Text>
        <Text style={estilos.descripcion}>{lugar.descripcion || lugar.descripcionCorta}</Text>

      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  centrado: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoError: { fontSize: 16, color: '#4B5563', marginBottom: 20 },
  botonVolverTexto: { padding: 12, backgroundColor: '#EBF3FB', borderRadius: 8 },
  textoBotonAzul: { color: '#0B5394', fontWeight: 'bold' },
  
  contenedorImagen: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  botonVolverFlotante: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  contenido: {
    flex: 1,
    padding: 20,
    marginTop: -20,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  tarjetaInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 12,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoInfo: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 10,
    flex: 1,
  },
  
  cajaAudioguia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B9D5F0',
  },
  // ---> NUEVO: Estilo para el botón circular de Play <---
  botonPlay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B5394',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Centra visualmente el triángulo del play
  },
  textoAudioguiaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B5394',
  },
  textoAudioguiaSub: {
    fontSize: 14,
    color: '#5C6B7A',
    marginTop: 2,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 40,
  },
});