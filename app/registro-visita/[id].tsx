// app/registro-visita/[id].tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function RegistroVisita() {
  const { id } = useLocalSearchParams(); // Este es el ID del lugar que leímos del QR
  const [nota, setNota] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  // Función para abrir la galería y elegir una foto (Requisito de la cátedra)
  const seleccionarFoto = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotoUri(resultado.assets[0].uri);
    }
  };

  const guardarVisita = () => {
    // Acá en el futuro guardaremos en la base de datos local (SQLite)
    Alert.alert(
      "¡Visita guardada!",
      "Tu recorrido se actualizó exitosamente. Se sincronizará cuando tengas internet.",
      [{ text: "Genial", onPress: () => router.navigate('/(tabs)') }]
    );
  };

  return (
    <ScrollView style={estilos.contenedor} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Registrar Visita', headerStyle: { backgroundColor: '#0B5394' }, headerTintColor: '#FFF' }} />
      
      <View style={estilos.contenido}>
        <Text style={estilos.titulo}>¡Llegaste a tu destino!</Text>
        <Text style={estilos.subtitulo}>Lugar ID: {id}</Text>

        {/* Sección de la Foto */}
        <Text style={estilos.etiqueta}>Agregá una foto de tu visita</Text>
        <Pressable style={estilos.cajaFoto} onPress={seleccionarFoto}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={estilos.imagenSeleccionada} />
          ) : (
            <View style={estilos.placeholderFoto}>
              <Ionicons name="camera-outline" size={40} color="#0B5394" />
              <Text style={estilos.textoCajaFoto}>Tocar para elegir foto</Text>
            </View>
          )}
        </Pressable>

        {/* Sección de la Nota */}
        <Text style={estilos.etiqueta}>¿Qué te pareció el lugar?</Text>
        <TextInput
          style={estilos.inputNota}
          placeholder="Escribí una nota corta sobre tu experiencia..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={nota}
          onChangeText={setNota}
        />

        {/* Botón Guardar */}
        <Pressable style={estilos.botonGuardar} onPress={guardarVisita}>
          <Text style={estilos.textoBotonGuardar}>Guardar en Mi Recorrido</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  contenido: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center', marginTop: 10 },
  subtitulo: { fontSize: 14, color: '#5C6B7A', textAlign: 'center', marginBottom: 30 },
  etiqueta: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 10 },
  
  cajaFoto: {
    height: 200,
    backgroundColor: '#EBF3FB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0B5394',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  placeholderFoto: { alignItems: 'center' },
  textoCajaFoto: { color: '#0B5394', marginTop: 8, fontWeight: '500' },
  imagenSeleccionada: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  inputNota: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  
  botonGuardar: {
    backgroundColor: '#0B5394',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonGuardar: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});