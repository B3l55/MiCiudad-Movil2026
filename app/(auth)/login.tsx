// app/(auth)/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { authService } from '../../src/servicios/auth';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const [mostrarBiometria, setMostrarBiometria] = useState(false);
  
  const manejarBiometria = async (mostrarAviso = true) => {
    const exito = await authService.autenticarConBiometria();
    if (exito) {
      router.replace('/(tabs)' as any);
    } else if (mostrarAviso) {
      
      Alert.alert('Autenticación fallida', 'Usá tu correo y contraseña para ingresar.');
    }
  };

  useEffect(() => {
    const verificarSesion = async () => {
      const token = await authService.obtenerToken();
      console.log('LOGIN → hay token:', !!token);
      if (token) {
        
        const biometriaActiva = await authService.esBiometriaSoportada();
        setMostrarBiometria(biometriaActiva);
        if (biometriaActiva) manejarBiometria(false);
      }
    };
    verificarSesion();
  }, []);

  const manejarLogin = async () => {
    if (!correo || !contrasena) {
      setError("Por favor completá ambos campos.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const exito = await authService.iniciarSesion(correo, contrasena);
      if (exito) {
        router.replace('/(tabs)' as any);
      } else {
        setError("Correo electrónico o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Ocurrió un error al conectar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/colon.jpg')}
      style={estilos.contenedor}
      resizeMode="cover"
    >
      <View style={estilos.capaOscura}>

        <View style={estilos.cajaIcono}>
          <Ionicons name="location-outline" size={64} color="#FFFFFF" />
        </View>
        <Text style={estilos.titulo}>Ingresar a Mi Ciudad</Text>

        {error && <Text style={estilos.textoError}>{error}</Text>}

        <View style={estilos.formulario}>
          <TextInput
            style={estilos.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#666666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <TextInput
            style={estilos.input}
            placeholder="Contraseña"
            placeholderTextColor="#666666"
            secureTextEntry
            value={contrasena}
            onChangeText={setContrasena}
          />

          <Pressable
            style={estilos.botonIngresar}
            onPress={manejarLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBoton}>Ingresar</Text>
            )}
          </Pressable>

          {mostrarBiometria && (
            <Pressable style={estilos.botonBiometria} onPress={() => manejarBiometria()}>
              <Ionicons name="finger-print-outline" size={24} color="#FFFFFF" />
              <Text style={estilos.textoBiometria}>Reingresar con biometría</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={{ marginTop: 12, paddingVertical: 8 }}
          onPress={() => router.push('/registro')}
        >
          <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14, textDecorationLine: 'underline' }}>
            ¿No tenés cuenta? Registrate acá
          </Text>
        </Pressable>

      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  capaOscura: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cajaIcono: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  formulario: {
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#000000', 
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E6EB',
    fontSize: 16,
  },
  botonIngresar: {
    backgroundColor: '#0B5394',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonBiometria: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  textoBiometria: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textoError: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
  },
});