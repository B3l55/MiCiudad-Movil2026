// app/registro-visita/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { fetch } from 'expo/fetch';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BASE_URL } from '../../src/config/api';
import { visitasServicio } from '../../src/servicios/visitas';

export default function RegistrarVisita() {
  // id del LUGAR que se está visitando
  const { id } = useLocalSearchParams();
  const [nota, setNota] = useState('');

  // url que devuelve la API al subir la foto (es lo que va en fotoUri)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoUriLocal, setFotoUriLocal] = useState<string | null>(null);

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const seleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.3, // Comprimida para que pese poco
    });

    if (!resultado.canceled && resultado.assets[0].uri) {
      setSubiendoFoto(true);
      const uriLocal = resultado.assets[0].uri;
      setFotoUriLocal(uriLocal);

      try {
        // El fetch de Expo solo acepta archivos reales (File), no objetos {uri, name, type}
        const formData = new FormData();
        formData.append('archivo', new File(uriLocal));

        const token = await SecureStore.getItemAsync('token_sesion');

        const respuesta = await fetch(`${BASE_URL}/archivos`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            // Sin Content-Type: fetch genera el boundary multipart solo
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        const respuestaTexto = await respuesta.text();
        let json: any;
        try {
          json = JSON.parse(respuestaTexto);
        } catch (e) {
          throw new Error('Respuesta inválida del servidor: ' + respuestaTexto);
        }

        if (!respuesta.ok) {
          const mensajeError = json.error?.mensaje || json.mensaje || json.error || 'Error al subir la imagen';
          throw new Error(typeof mensajeError === 'string' ? mensajeError : JSON.stringify(mensajeError));
        }

        // La API responde con el sobre { datos: {...}, meta: null }
        console.log('Respuesta de /archivos:', json.datos);
        const url = json.datos?.url ?? json.datos?.clave;
        if (!url) {
          throw new Error('El servidor no devolvió la dirección del archivo.');
        }

        setFotoUrl(url);
      } catch (error: any) {
        console.error('Error detallado al subir foto:', error);
        Alert.alert('Error al subir', error.message || 'No se pudo subir la foto.');
        setFotoUriLocal(null);
        setFotoUrl(null);
      } finally {
        setSubiendoFoto(false);
      }
    }
  };

  const guardarVisita = async () => {
    setGuardando(true);
    try {
      // Crea la visita al lugar con la nota y la foto (ambas opcionales)
      await visitasServicio.registrarVisita({
        lugarId: String(id),
        origen: 'manual',
        nota: nota.trim() || null,
        fotoUri: fotoUrl || null,
      });

      Alert.alert('¡Listo!', 'Visita registrada con éxito.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message || 'No se pudo registrar la visita.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ title: 'Registrar visita', headerBackTitle: 'Volver' }} />

      <ScrollView contentContainerStyle={estilos.scroll}>
        <Text style={estilos.titulo}>Completá tu visita</Text>
        <Text style={estilos.subtitulo}>Agregá un recuerdo de este lugar a tu recorrido.</Text>

        {/* Sección Foto */}
        <Text style={estilos.etiqueta}>Foto (opcional)</Text>
        <Pressable style={estilos.cajaFoto} onPress={seleccionarFoto} disabled={subiendoFoto}>
          {fotoUriLocal ? (
            <Image source={{ uri: fotoUriLocal }} style={estilos.imagen} />
          ) : (
            <View style={estilos.placeholderFoto}>
              <Ionicons name="camera-outline" size={32} color="#0B5394" />
              <Text style={estilos.textoFoto}>Tocar para elegir una foto</Text>
            </View>
          )}
          {subiendoFoto && (
            <View style={estilos.cargandoFoto}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
          )}
        </Pressable>

        {/* Sección Nota */}
        <Text style={estilos.etiqueta}>Comentario (opcional)</Text>
        <View style={estilos.cajaInput}>
          <TextInput
            style={estilos.input}
            placeholder="¿Qué te pareció este lugar?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={nota}
            onChangeText={setNota}
            textAlignVertical="top"
          />
        </View>

        {/* Botón Guardar */}
        <Pressable
          style={[estilos.botonPrincipal, (guardando || subiendoFoto) && estilos.botonDeshabilitado]}
          onPress={guardarVisita}
          disabled={guardando || subiendoFoto}
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
    marginBottom: 24,
  },
  placeholderFoto: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  textoFoto: { color: '#0B5394', fontWeight: '500' },
  imagen: { width: '100%', height: '100%', resizeMode: 'cover' },
  cargandoFoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cajaInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 32,
  },
  input: { fontSize: 16, color: '#1C1C1E', minHeight: 100 },
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