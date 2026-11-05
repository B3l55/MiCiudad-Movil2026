// app/registro-visita/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BASE_URL } from '../../src/config/api';
import { visitasServicio } from '../../src/servicios/visitas';
import { obtenerFotoTemporal } from '../../src/utilidades/fotoTemporal';

const NGROK_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
  'User-Agent': 'MiCiudadApp',
};

const urlDeArchivo = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('file://') || url.startsWith('content://') || url.startsWith('ph://')) {
    return url;
  }
  const rutaLimpia = url.replace(/\\/g, '/');
  const indice = rutaLimpia.indexOf('/archivos/');
  if (indice !== -1) {
    return `${BASE_URL}${rutaLimpia.slice(indice)}`;
  }
  if (rutaLimpia.startsWith('http')) return rutaLimpia;
  return `${BASE_URL}${rutaLimpia.startsWith('/') ? '' : '/'}${rutaLimpia}`;
};

export default function RegistrarVisita() {
  const { id } = useLocalSearchParams();
  const [nota, setNota] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fotoCapturada = obtenerFotoTemporal();
      if (fotoCapturada) {
        setFotoUri(fotoCapturada);
      }
    }, [])
  );

  const elegirDeGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para elegir una foto.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
    });
    if (!resultado.canceled && resultado.assets[0].uri) {
      setFotoUri(resultado.assets[0].uri);
    }
  };

  const sacarFoto = () => {
    router.push('/camara' as any);
  };

  const guardarVisita = async () => {
    setGuardando(true);
    try {
      const { sincronizada } = await visitasServicio.registrarVisita({
        lugarId: String(id),
        origen: 'manual',
        nota: nota.trim() || null,
        fotoLocalUri: fotoUri,
      });

      Alert.alert(
        sincronizada ? '¡Listo!' : 'Visita guardada',
        sincronizada
          ? 'Visita registrada con éxito.'
          : 'No hay conexión. Guardamos tu visita en el teléfono y se subirá sola cuando vuelva la señal.',
        [{ text: 'OK', onPress: () => router.replace('/recorrido' as any) }]
      );
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message || 'No se pudo registrar la visita.');
    } finally {
      setGuardando(false);
    }
  };

  const fotoVistaPrevia = urlDeArchivo(fotoUri);

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ title: 'Registrar visita', headerBackTitle: 'Volver' }} />

      <ScrollView contentContainerStyle={estilos.scroll}>
        <Text style={estilos.titulo}>Completá tu visita</Text>
        <Text style={estilos.subtitulo}>Agregá un recuerdo de este lugar a tu recorrido.</Text>

        {/* Sección Foto */}
        <Text style={estilos.etiqueta}>Foto (opcional)</Text>
        <View style={estilos.cajaFoto}>
          {fotoVistaPrevia ? (
            <Image
              source={{
                uri: fotoVistaPrevia,
                headers: NGROK_HEADERS,
              }}
              style={estilos.imagen}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={estilos.placeholderFoto}>
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
              <Text style={estilos.textoFoto}>Todavía no elegiste una foto</Text>
            </View>
          )}
        </View>
        <View style={estilos.filaBotonesFoto}>
          <Pressable style={estilos.botonFoto} onPress={sacarFoto}>
            <Ionicons name="camera-outline" size={22} color="#0B5394" />
            <Text style={estilos.textoBotonFoto}>Sacar foto</Text>
          </Pressable>
          <Pressable style={estilos.botonFoto} onPress={elegirDeGaleria}>
            <Ionicons name="images-outline" size={22} color="#0B5394" />
            <Text style={estilos.textoBotonFoto}>Galería</Text>
          </Pressable>
        </View>

        {/* Sección Nota */}
        <Text style={estilos.etiqueta}>Comentario (opcional)</Text>
        <View style={estilos.cajaInput}>
          <TextInput
            style={estilos.input}
            placeholder="¿Qué te pareció este lugar?"
            placeholderTextColor="#666666"
            multiline
            numberOfLines={4}
            value={nota}
            onChangeText={setNota}
            textAlignVertical="top"
          />
        </View>

        {/* Botón Guardar */}
        <Pressable
          style={[estilos.botonPrincipal, guardando && estilos.botonDeshabilitado]}
          onPress={guardarVisita}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBoton}>Guardar en Mi Recorrido</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 6 },
  subtitulo: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  etiqueta: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12 },
  cajaFoto: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 12,
  },
  placeholderFoto: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  textoFoto: { color: '#6B7280', fontWeight: '500' },
  imagen: { width: '100%', height: '100%' },
  filaBotonesFoto: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  botonFoto: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0B5394',
    backgroundColor: '#EBF3FB',
  },
  textoBotonFoto: { color: '#0B5394', fontWeight: '600', fontSize: 15 },
  cajaInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 32,
  },
  input: { fontSize: 16, color: '#000000', minHeight: 100 },
  botonPrincipal: {
    backgroundColor: '#0B5394',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: { opacity: 0.7 },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});