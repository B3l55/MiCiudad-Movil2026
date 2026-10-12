// app/(tabs)/_layout.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { Tabs, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authService } from '../../src/servicios/auth';

export default function TabsLayout() {
  const [verificando, setVerificando] = useState(true);

  // El "guardia de seguridad": revisa el token antes de dibujar las pestañas
  useEffect(() => {
    const controlarAcceso = async () => {
      const token = await authService.obtenerToken();
      
      if (!token) {
        // Si no hay token, lo mandamos al Login obligatoriamente
        router.replace('/auth/login');
      } else {
        // Si hay token, lo dejamos pasar
        setVerificando(false);
      }
    };
    controlarAcceso();
  }, []);

  // Mientras busca en SecureStore, mostramos una pantalla de carga vacía
  if (verificando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }}>
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: false, // Oculta el título superior por defecto
      tabBarActiveTintColor: '#0B5394' // Color azul para el ícono seleccionado
    }}>
      
      {/* Pestaña 1: El Inicio (Mapa) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} />,
        }}
      />

      {/* Pestaña 2: Explorar/Lugares (La dejamos preparada) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={24} color={color} />,
        }}
      />
      
    </Tabs>
  );
}