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
        // Si NO hay sesión, redirige automáticamente al login
        router.replace('/login' as any);
      } else {
        // Si SÍ hay sesión, carga el mapa y las pestañas principales
        router.replace('/(tabs)' as any);
      }
    } catch (error) {
      router.replace('/login' as any);
    }
  };

  // Pantalla de carga limpia mientras valida la sesión
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0B5394" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});