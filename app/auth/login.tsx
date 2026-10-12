// app/(auth)/login.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { authService } from '../../src/servicios/auth';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bandera para saber si mostramos el botón de la huella
  const [haySesionPrevia, setHaySesionPrevia] = useState(false);

  // Al abrir la pantalla, verificamos si ya existe un token guardado en SecureStore
  useEffect(() => {
    const verificarSesion = async () => {
      const token = await authService.obtenerToken();
      if (token) {
        setHaySesionPrevia(true);
      }
    };
    verificarSesion();
  }, []);

  // Función para el ingreso tradicional (correo + contraseña)
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
        router.replace('/(tabs)'); 
      } else {
        // Reemplazá la línea anterior por esta:
        setError("Correo electrónico o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Ocurrió un error al conectar.");
    } finally {
      setCargando(false);
    }
  };

  // Función para reingresar rápidamente usando biometría
  const manejarBiometria = async () => {
    const exito = await authService.autenticarConBiometria();
    if (exito) {
      router.replace('/(tabs)');
    } else {
      setError("No se pudo verificar la identidad biométrica.");
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/colon.jpg')} // URL de prueba, después podés poner un require()
      style={estilos.contenedor}
      resizeMode="cover"
    >
      {/* Esta capa oscura es fundamental para que el formulario se lea bien contra la foto */}
      <View style={estilos.capaOscura}>
        
        <View style={estilos.cajaIcono}>
          {/* Ícono en color blanco */}
          <Ionicons name="location-outline" size={64} color="#FFFFFF" /> 
        </View>
        <Text style={estilos.titulo}>Ingresar a Mi Ciudad</Text>

        {error && <Text style={estilos.textoError}>{error}</Text>}

        <View style={estilos.formulario}>
          <TextInput
            style={estilos.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />
          
          <TextInput
            style={estilos.input}
            placeholder="Contraseña"
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

          {haySesionPrevia && (
            <Pressable style={estilos.botonBiometria} onPress={manejarBiometria}>
              {/* Ícono de biometría pasado a blanco */}
              <Ionicons name="finger-print-outline" size={24} color="#FFFFFF" />
              <Text style={estilos.textoBiometria}>Reingresar con biometría</Text>
            </Pressable>
          )}
        </View>
          <Pressable 
            style={{ marginTop: 12, paddingVertical: 8 }} 
            onPress={() => alert('El registro de usuarios se habilitará en la próxima etapa.')}
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
    // Eliminamos backgroundColor, justifyContent y padding de acá
  },
  capaOscura: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 50% de opacidad negra sobre la foto
  },
  cajaIcono: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // Pasado a blanco para que contraste
    textAlign: 'center',
    marginBottom: 32,
  },
  formulario: {
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF', // Pasado a blanco para que contraste
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