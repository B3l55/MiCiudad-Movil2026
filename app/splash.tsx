// app/splash.tsx
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    verificarToken();
  }, []);

  const verificarToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('token_sesion');
      
      if (!token) {
        router.replace('/(auth)/login');
      } else {
        
        router.replace('/(tabs)');
      }
      
    } catch (error) {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={estilos.container}>
      <ActivityIndicator size="large" color="#0B5394" />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});