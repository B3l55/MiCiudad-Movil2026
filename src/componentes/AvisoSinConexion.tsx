// src/componentes/AvisoSinConexion.tsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRed } from '../hooks/useRed';

export default function AvisoSinConexion() {
  const { sinConexion } = useRed();
  const insets = useSafeAreaInsets();

  if (!sinConexion) return null;

  return (
    <View style={[estilos.barra, { paddingTop: insets.top + 8 }]} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={20} color="#FFFFFF" />
      <Text style={estilos.texto}>Sin conexión. Algunas funciones no están disponibles.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#B91C1C',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  texto: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});