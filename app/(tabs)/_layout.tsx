import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B5394',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
    </Tabs>
  );
}