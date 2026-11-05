// app/(tabs)/perfil.tsx
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BASE_URL } from '../../src/config/api';
import { usuarioServicio } from '../../src/servicios/usuario';

const obtenerUrlCompleta = (ruta: string | null) => {
  if (!ruta) return null;
  if (ruta.startsWith('file://') || ruta.startsWith('content://') || ruta.startsWith('ph://')) {
    return ruta;
  }
  const rutaLimpia = ruta.replace(/\\/g, '/');
  const indice = rutaLimpia.indexOf('/archivos/');
  if (indice !== -1) {
    return `${BASE_URL}${rutaLimpia.slice(indice)}`;
  }
  if (rutaLimpia.startsWith('http')) return rutaLimpia;
  return `${BASE_URL}${rutaLimpia.startsWith('/') ? '' : '/'}${rutaLimpia}`;
};

export default function PerfilTab() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      const cargarPerfil = async () => {
        setCargando(true);
        try {
          const perfil = await usuarioServicio.obtenerPerfil();
          if (activo && perfil) {
            setNombre(perfil.nombre || '');
            setAvatarUrl(obtenerUrlCompleta(perfil.avatarUrl || null));
          }
        } catch (error) {
          console.error('Error al cargar avatar en perfil:', error);
        } finally {
          if (activo) setCargando(false);
        }
      };
      cargarPerfil();
      return () => { activo = false; };
    }, [])
  );

  const cerrarSesion = async () => {
    await SecureStore.deleteItemAsync('token_sesion');
    await SecureStore.deleteItemAsync('usuario_info');
    router.replace('/(auth)/login');
  };

  return (
    <View style={estilos.contenedor}>
      {cargando ? (
        <ActivityIndicator size="large" color="#0B5394" style={{ marginBottom: 20 }} />
      ) : avatarUrl ? (
        <Image
          source={{
            uri: avatarUrl,
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'User-Agent': 'MiCiudadApp',
            },
          }}
          style={estilos.avatar}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={110} color="#0B5394" />
      )}

      <Text style={estilos.titulo}>{nombre ? nombre : 'Mi Cuenta'}</Text>

      <Pressable style={estilos.botonConfig} onPress={() => router.push('/editar-perfil')}>
        <Ionicons name="pencil" size={20} color="#FFFFFF" />
        <Text style={estilos.textoBoton}>Editar Datos</Text>
      </Pressable>

      <Pressable style={estilos.botonSalir} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
        <Text style={estilos.textoSalir}>Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#0B5394', marginBottom: 8 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginTop: 12, marginBottom: 36, textAlign: 'center' },
  botonConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  botonSalir: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  textoSalir: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
});