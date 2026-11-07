// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AvisoSinConexion from '../../src/componentes/AvisoSinConexion';
import { useRed } from '../../src/hooks/useRed';
import { sincronizarVisitasPendientes } from '../../src/servicios/visitas';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { sinConexion } = useRed(); 

  
  useEffect(() => {
    if (!sinConexion) {
      sincronizarVisitasPendientes().catch((error) => console.log('Error al sincronizar visitas:', error));
    }
  }, [sinConexion]);

  return (
    <View style={{ flex: 1 }}>
      <AvisoSinConexion />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0B5394',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
            paddingBottom: 5 + insets.bottom,
            paddingTop: 5,
            height: 60 + insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />) }} />
        <Tabs.Screen name="favoritos" options={{ title: 'Favoritos', tabBarIcon: ({ color, size }) => (<Ionicons name="heart" size={size} color={color} />) }} />
        <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: ({ color, size }) => (<Ionicons name="calendar" size={size} color={color} />) }} />
        <Tabs.Screen name="mis-eventos" options={{ title: 'Mis Eventos', tabBarIcon: ({ color, size }) => (<Ionicons name="bookmark" size={size} color={color} />) }} />
        <Tabs.Screen
          name="recorrido"
          options={{
            title: 'Mi Recorrido',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}