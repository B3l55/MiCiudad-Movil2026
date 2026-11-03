// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/useColorScheme';

export const unstable_settings = {
  // Le indicamos a Expo que arranque por nuestro redirect renombrado
  initialRouteName: 'splash',
};

export default function RootLayout() {
  // const colorScheme = useColorScheme();

  return (
    <>
      <Stack>
        {/* Pantalla inicial de carga y redirección */}
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Registro explícito de la carpeta (auth) sin barra superior */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}