// src/componentes/ReproductorAudioguia.tsx
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Constants, { ExecutionEnvironment } from 'expo-constants'; 
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AUDIO_DE_PRUEBA, USAR_AUDIO_DE_PRUEBA } from '../config/audio';
import { Audioguia } from '../tipos/lugares';

interface Props {
  audioguia: Audioguia;
  titulo: string; 
}

const SALTO_SEGUNDOS = 15;


const EN_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;


const formatear = (segundos: number) => {
  const total = Math.max(0, Math.round(segundos));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export default function ReproductorAudioguia({ audioguia, titulo }: Props) {
  const url = USAR_AUDIO_DE_PRUEBA ? AUDIO_DE_PRUEBA : audioguia.url;
  const player = useAudioPlayer(url);
  const estado = useAudioPlayerStatus(player);

  
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);

  
  useEffect(() => {
    if (estado.didJustFinish) {
      player.pause();
      player.seekTo(0);
    }
  }, [estado.didJustFinish, player]);

  const duracion = estado.duration > 0 ? estado.duration : audioguia.duracionSegundos;
  const progreso = duracion > 0 ? Math.min(1, estado.currentTime / duracion) : 0;
  const restante = duracion - estado.currentTime;

  const alternar = () => {
    if (estado.playing) {
      player.pause();
      return;
    }
    
    if (!EN_EXPO_GO) {
      try {
        player.setActiveForLockScreen(true, { title: titulo, artist: 'Mi Ciudad · Colón' });
      } catch {
        
      }
    }
    player.play();
  };

  const saltar = (segundos: number) => {
    const destino = Math.min(Math.max(0, estado.currentTime + segundos), duracion);
    player.seekTo(destino);
  };

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>Audioguía</Text>
      <Text style={estilos.subtitulo}>{estado.isLoaded ? titulo : 'Cargando audio...'}</Text>

      <View style={estilos.barraFondo}>
        <View style={[estilos.barraProgreso, { width: `${progreso * 100}%` }]} />
      </View>
      <View style={estilos.filaTiempos}>
        <Text style={estilos.tiempo}>{formatear(estado.currentTime)}</Text>
        <Text style={estilos.tiempo}>-{formatear(restante)}</Text>
      </View>

      <View style={estilos.filaControles}>
        <Pressable
          style={estilos.botonSalto}
          onPress={() => saltar(-SALTO_SEGUNDOS)}
          accessibilityLabel="Retroceder 15 segundos"
        >
          <Ionicons name="play-back" size={26} color="#0B5394" />
          <Text style={estilos.textoSalto}>15 s</Text>
        </Pressable>

        <Pressable
          style={[estilos.botonPlay, !estado.isLoaded && estilos.botonDeshabilitado]}
          onPress={alternar}
          disabled={!estado.isLoaded}
          accessibilityLabel={estado.playing ? 'Pausar audioguía' : 'Reproducir audioguía'}
        >
          <Ionicons name={estado.playing ? 'pause' : 'play'} size={32} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={estilos.botonSalto}
          onPress={() => saltar(SALTO_SEGUNDOS)}
          accessibilityLabel="Adelantar 15 segundos"
        >
          <Ionicons name="play-forward" size={26} color="#0B5394" />
          <Text style={estilos.textoSalto}>15 s</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 24 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  subtitulo: { fontSize: 14, color: '#5C6B7A', marginTop: 2, marginBottom: 14 },
  barraFondo: { height: 6, backgroundColor: '#D1D5DB', borderRadius: 3, overflow: 'hidden' },
  barraProgreso: { height: 6, backgroundColor: '#0B5394' },
  filaTiempos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tiempo: { fontSize: 13, color: '#5C6B7A' },
  filaControles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 12 },
  botonSalto: { alignItems: 'center', justifyContent: 'center', minWidth: 56, minHeight: 56 },
  textoSalto: { fontSize: 12, fontWeight: '600', color: '#0B5394' },
  botonPlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0B5394',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: { opacity: 0.5 },
});