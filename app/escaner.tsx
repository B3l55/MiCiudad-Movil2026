// app/escaner.tsx
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function PantallaEscaner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Si los permisos todavía no se cargaron
  if (!permission) {
    return <View style={estilos.centrado}><Text>Cargando permisos...</Text></View>;
  }

  // Si el usuario denegó el permiso de la cámara
  if (!permission.granted) {
    return (
      <View style={estilos.centrado}>
        <Stack.Screen options={{ title: 'Escanear QR', headerStyle: { backgroundColor: '#0B5394' }, headerTintColor: '#fff' }} />
        <Text style={estilos.textoPermiso}>Necesitamos acceso a la cámara para leer los códigos QR de Colón.</Text>
        <Pressable style={estilos.botonPermiso} onPress={requestPermission}>
          <Text style={estilos.textoBoton}>Dar permisos</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    alert(`QR Detectado: ${data}`);
    // Aquí luego podemos procesar el código (ej: "COLON:lug-004") y llevarlo al detalle
    router.back();
  };

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ title: 'Escanear QR de la Peatonal', headerStyle: { backgroundColor: '#0B5394' }, headerTintColor: '#fff' }} />
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={estilos.capaInferior}>
          <Text style={estilos.instruccion}>Apuntá al código QR del cartel</Text>
          {scanned && (
            <Pressable style={estilos.botonEscanearDeNuevo} onPress={() => setScanned(false)}>
              <Text style={estilos.textoBoton}>Escanear de nuevo</Text>
            </Pressable>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F2F2F7',
  },
  textoPermiso: {
    textAlign: 'center',
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  botonPermiso: {
    backgroundColor: '#0B5394',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  capaInferior: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 60,
    padding: 16,
  },
  instruccion: {
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  botonEscanearDeNuevo: {
    marginTop: 16,
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});