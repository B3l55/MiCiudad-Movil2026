// app/camara.tsx
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { guardarFotoTemporal } from '../src/utilidades/fotoTemporal';

export default function PantallaCamara() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const camaraRef = useRef<CameraView>(null);
  const [lado, setLado] = useState<'back' | 'front'>('back');
  const [sacando, setSacando] = useState(false);
  const insets = useSafeAreaInsets();

  if (!permiso) {
    return (
      <View style={estilos.centrado}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  
  if (!permiso.granted) {
    return (
      <View style={estilos.centrado}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="camera-outline" size={56} color="#9CA3AF" />
        <Text style={estilos.textoPermiso}>
          Necesitamos la cámara para sacar la foto de tu visita. También podés elegir una de la galería.
        </Text>
        <Pressable
          style={estilos.botonPrincipal}
          onPress={permiso.canAskAgain ? pedirPermiso : () => Linking.openSettings()}
        >
          <Text style={estilos.textoBotonPrincipal}>{permiso.canAskAgain ? 'Dar permiso' : 'Abrir Ajustes'}</Text>
        </Pressable>
        <Pressable style={estilos.botonSecundario} onPress={() => router.back()}>
          <Text style={estilos.textoBotonSecundario}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const sacarFoto = async () => {
    if (!camaraRef.current || sacando) return;
    setSacando(true);
    try {
      console.log('CÁMARA → sacando foto');
      const foto = await camaraRef.current.takePictureAsync({
        quality: 0.3,
        skipProcessing: true,
        shutterSound: false,
      });
      console.log('CÁMARA → foto lista:', foto?.uri);
      if (foto?.uri) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          
        }
        await guardarFotoTemporal(foto.uri);
        console.log('CÁMARA → volviendo');
        router.back();
      }
    } catch (error) {
      console.log('No se pudo sacar la foto:', error);
      Alert.alert('No se pudo sacar la foto', 'Probá de nuevo.');
    } finally {
      setSacando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ headerShown: false }} />

      <CameraView ref={camaraRef} style={estilos.camara} facing={lado} />

      <View style={[estilos.barraControles, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={estilos.botonLateral}
          onPress={() => router.back()}
          accessibilityLabel="Cancelar"
        >
          <Ionicons name="close" size={30} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={[estilos.botonDisparo, sacando && estilos.botonDeshabilitado]}
          onPress={sacarFoto}
          disabled={sacando}
          accessibilityLabel="Sacar foto"
        >
          {sacando ? <ActivityIndicator color="#0B5394" /> : <View style={estilos.centroDisparo} />}
        </Pressable>

        <Pressable
          style={estilos.botonLateral}
          onPress={() => setLado((actual) => (actual === 'back' ? 'front' : 'back'))}
          accessibilityLabel="Girar cámara"
        >
          <Ionicons name="camera-reverse-outline" size={30} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000' },
  camara: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F2F2F7', gap: 16 },
  textoPermiso: { textAlign: 'center', fontSize: 16, color: '#374151', lineHeight: 22 },
  botonPrincipal: { backgroundColor: '#0B5394', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10 },
  textoBotonPrincipal: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  botonSecundario: { paddingHorizontal: 24, paddingVertical: 12 },
  textoBotonSecundario: { color: '#0B5394', fontWeight: '600', fontSize: 16 },
  barraControles: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  botonLateral: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  botonDisparo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centroDisparo: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF' },
  botonDeshabilitado: { opacity: 0.6 },
});