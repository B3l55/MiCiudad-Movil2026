import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function PerfilTab() {
  const cerrarSesion = async () => {
    await SecureStore.deleteItemAsync('token_sesion');
    // Navega de vuelta al login usando replace para borrar el historial
    router.replace('/(auth)/login');
  };

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="person-circle-outline" size={100} color="#0B5394" />
      <Text style={estilos.titulo}>Mi Cuenta</Text>

      {/* Navega a la pantalla de edición que creamos antes */}
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
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginTop: 16, marginBottom: 40 },
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