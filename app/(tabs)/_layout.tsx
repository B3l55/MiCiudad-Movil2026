import Ionicons from '@react-native-vector-icons/ionicons';
import { Tabs } from 'expo-router';

export default function LayoutTabs() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0B5394' }}>
      
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={22} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="agenda" 
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={22} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="recorrido" 
        options={{
          title: 'Mi recorrido',
          tabBarIcon: ({ color }) => (
            <Ionicons name="footsteps-outline" size={22} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="perfil" 
        options={{
          title: 'Yo',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }} 
      />

    </Tabs>
  );
}