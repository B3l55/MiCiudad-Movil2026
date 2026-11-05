// app/registro.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { usuarioServicio } from '../src/servicios/usuario';

export default function RegistroPantalla() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (!nombre || !email || !clave) {
      Alert.alert('Datos incompletos', 'Por favor, completá todos los campos.');
      return;
    }

    setCargando(true);
    try {
      await usuarioServicio.registrar({ nombre, email, clave });
      Alert.alert('¡Éxito!', 'Cuenta creada correctamente. Ya podés iniciar sesión.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error al registrar', error.message || 'No se pudo crear la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
      </Pressable>

      <View style={estilos.cuerpo}>
        <Text style={estilos.titulo}>Crear Cuenta</Text>
        <Text style={estilos.subtitulo}>Completá tus datos para registrarte en Mi Ciudad</Text>

        <View style={estilos.contenedorInput}>
          <Ionicons name="person-outline" size={20} color="#6B7280" />
          <TextInput
            style={estilos.input}
            placeholder="Nombre completo"
            placeholderTextColor="#666666"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
        </View>

        <View style={estilos.contenedorInput}>
          <Ionicons name="mail-outline" size={20} color="#6B7280" />
          <TextInput
            style={estilos.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={estilos.contenedorInput}>
          <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
          <TextInput
            style={estilos.input}
            placeholder="Contraseña"
            placeholderTextColor="#666666"
            value={clave}
            onChangeText={setClave}
            secureTextEntry
          />
        </View>

        <Pressable 
          style={[estilos.botonPrincipal, cargando && estilos.botonDeshabilitado]} 
          onPress={manejarRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBotonPrincipal}>Registrarme</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FFFFFF' },
  botonVolver: { padding: 20 },
  cuerpo: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 100 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  subtitulo: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, color: '#000000' },
  botonPrincipal: {
    backgroundColor: '#0B5394',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  botonDeshabilitado: { opacity: 0.7 },
  textoBotonPrincipal: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});