// app/editar-perfil.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { categoriasServicio } from '../src/servicios/categoria';
import { usuarioServicio } from '../src/servicios/usuario';
import { Categoria } from '../src/tipos/categorias';

const BASE_URL = 'http://192.168.1.3:3000';

export default function EditarPerfil() {
  const [nombre, setNombre] = useState('');
  const [fotoClave, setFotoClave] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [preferenciasSeleccionadas, setPreferenciasSeleccionadas] = useState<string[]>([]);
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [perfil, resCategorias] = await Promise.all([
        usuarioServicio.obtenerPerfil(),
        categoriasServicio.obtenerCategorias(),
      ]);

      if (perfil) {
        setNombre(perfil.nombre || '');
        setFotoClave(perfil.foto || null);
        if (perfil.preferencias?.categoriasFavoritas) {
          setPreferenciasSeleccionadas(perfil.preferencias.categoriasFavoritas);
        }
      }

      setCategorias(resCategorias.datos || resCategorias || []);
    } catch (error) {
      console.error('Error al cargar perfil o categorías:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarYSubirFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para cambiar la foto.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets[0].uri) {
      setSubiendoFoto(true);
      try {
        const claveRecibida = await usuarioServicio.subirFoto(resultado.assets[0].uri);
        setFotoClave(claveRecibida);
      } catch (error: any) {
        Alert.alert('Error al subir foto', error.message || 'Ocurrió un problema.');
      } finally {
        setSubiendoFoto(false);
      }
    }
  };

  const alternarCategoria = (idCat: string) => {
    if (preferenciasSeleccionadas.includes(idCat)) {
      setPreferenciasSeleccionadas(prev => prev.filter(id => id !== idCat));
    } else {
      setPreferenciasSeleccionadas(prev => [...prev, idCat]);
    }
  };

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }

    setGuardando(true);
    try {
      await usuarioServicio.actualizarPerfil({
        nombre: nombre.trim(),
        foto: fotoClave || undefined,
        preferencias: {
          categoriasFavoritas: preferenciasSeleccionadas,
        },
      });

      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message || 'No se pudieron aplicar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  const urlFoto = fotoClave ? `${BASE_URL}/archivos/${fotoClave}` : null;

  return (
    <SafeAreaView style={estilos.contenedor}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={estilos.headerBar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </Pressable>
        <Text style={estilos.tituloHeader}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.contenidoScroll}>
        {/* Foto de Perfil */}
        <View style={estilos.seccionFoto}>
          <View style={estilos.contenedorAvatar}>
            {urlFoto ? (
              <Image source={{ uri: urlFoto }} style={estilos.avatarImagen} />
            ) : (
              <Ionicons name="person-circle-outline" size={110} color="#0B5394" />
            )}

            <Pressable 
              style={estilos.botonCamara} 
              onPress={seleccionarYSubirFoto} 
              disabled={subiendoFoto}
            >
              {subiendoFoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
          <Text style={estilos.leyendaFoto}>Toca la cámara para cambiar tu foto</Text>
        </View>

        {/* Editar Nombre */}
        <Text style={estilos.etiquetaSeccion}>Nombre Completo</Text>
        <View style={estilos.contenedorInput}>
          <Ionicons name="person-outline" size={20} color="#6B7280" />
          <TextInput
            style={estilos.input}
            placeholder="Tu nombre completo"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
        </View>

        {/* Editar Preferencias (Categorías) */}
        <Text style={estilos.etiquetaSeccion}>Categorías Preferidas</Text>
        <Text style={estilos.subleyenda}>Seleccioná los temas de tu interés para destacar lugares en el inicio:</Text>

        <View style={estilos.contenedorChips}>
          {categorias.map((cat) => {
            const seleccionada = preferenciasSeleccionadas.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[estilos.chip, seleccionada && estilos.chipSeleccionado]}
                onPress={() => alternarCategoria(cat.id)}
              >
                <Ionicons 
                  name={seleccionada ? "checkmark-circle" : "add-circle-outline"} 
                  size={18} 
                  color={seleccionada ? "#FFFFFF" : "#0B5394"} 
                />
                <Text style={[estilos.textoChip, seleccionada && estilos.textoChipSeleccionado]}>
                  {cat.nombre}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Botón Guardar */}
        <Pressable 
          style={[estilos.botonGuardar, guardando && estilos.botonDeshabilitado]} 
          onPress={guardarCambios}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBotonGuardar}>Guardar Cambios</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FFFFFF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tituloHeader: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  contenidoScroll: { padding: 24, paddingBottom: 40 },
  seccionFoto: { alignItems: 'center', marginBottom: 28 },
  contenedorAvatar: { position: 'relative' },
  avatarImagen: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#0B5394' },
  botonCamara: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0B5394',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  leyendaFoto: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  etiquetaSeccion: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  subleyenda: { fontSize: 13, color: '#6B7280', marginBottom: 14 },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  contenedorChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0B5394',
    backgroundColor: '#FFFFFF',
  },
  chipSeleccionado: { backgroundColor: '#0B5394' },
  textoChip: { fontSize: 14, color: '#0B5394', fontWeight: '500' },
  textoChipSeleccionado: { color: '#FFFFFF', fontWeight: 'bold' },
  botonGuardar: {
    backgroundColor: '#0B5394',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: { opacity: 0.7 },
  textoBotonGuardar: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});