// app/lugares/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ReproductorAudioguia from '../../src/componentes/ReproductorAudioguia';
import { BASE_URL } from '../../src/config/api';
import { favoritosServicio } from '../../src/servicios/favoritos';
import { lugaresServicio } from '../../src/servicios/lugares';
import { Lugar } from '../../src/tipos/lugares';

const obtenerUrlCompleta = (ruta: string | null) => {
  if (!ruta) return null;
  if (ruta.startsWith('file://') || ruta.startsWith('content://') || ruta.startsWith('ph://')) {
    return ruta;
  }
  const rutaLimpia = ruta.replace(/\\/g, '/');
  const indice = rutaLimpia.indexOf('/archivos/');
  if (indice !== -1) {
    return `${BASE_URL}${rutaLimpia.slice(indice)}`;
  }
  if (rutaLimpia.startsWith('http')) return rutaLimpia;
  return `${BASE_URL}${rutaLimpia.startsWith('/') ? '' : '/'}${rutaLimpia}`;
};

export default function DetalleLugarPantalla() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);

  useEffect(() => {
    if (!id) return;

    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [datosLugar, idsFavoritos] = await Promise.all([
          lugaresServicio.obtenerLugarPorId(id as string),
          favoritosServicio.obtenerFavoritosIds()
        ]);
        setLugar(datosLugar);
        setEsFavorito(idsFavoritos.includes(id as string));
      } catch (error) {
        console.error('Error al cargar detalle del lugar:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const alternarFavorito = async () => {
    if (!id || cargandoFavorito) return;
    setCargandoFavorito(true);
    try {
      if (esFavorito) {
        await favoritosServicio.eliminarFavorito(id as string);
        setEsFavorito(false);
      } else {
        await favoritosServicio.agregarFavorito(id as string);
        setEsFavorito(true);
      }
    } catch (error) {
      console.error('Error al modificar favorito:', error);
    } finally {
      setCargandoFavorito(false);
    }
  };

  const formatearHorarios = (data: any): string => {
    if (!data) return 'Abierto - Consultar horarios';
    if (typeof data === 'string') return data;

    if (Array.isArray(data)) {
      if (data.length === 0) return 'Abierto - Consultar horarios';

      const horariosFormateados = data.map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          const dia = item.dia || item.dias || item.diaSemana || '';
          const abre = item.abre || item.apertura || item.desde || '';
          const cierra = item.cierra || item.cierre || item.hasta || '';
          const texto = item.texto || item.horario || item.descripcion;

          if (texto) return `${dia ? dia + ': ' : ''}${texto}`;
          if (abre && cierra) return `${dia ? dia + ' ' : ''}${abre} a ${cierra}`;
          if (abre) return `${dia ? dia + ' ' : ''}${abre}`;

          const valores = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number');
          if (valores.length > 0) return valores.join(' ');
        }
        return '';
      }).filter(Boolean);

      return horariosFormateados.length > 0 ? horariosFormateados.join(' | ') : 'Abierto - Consultar horarios';
    }

    if (typeof data === 'object' && data !== null) {
      const dia = data.dia || data.dias || '';
      const abre = data.abre || data.apertura || '';
      const cierra = data.cierra || data.cierre || '';
      const texto = data.texto || data.horario;

      if (texto) return `${dia ? dia + ': ' : ''}${texto}`;
      if (abre && cierra) return `${dia ? dia + ' ' : ''}${abre} a ${cierra}`;
      return Object.values(data).filter(v => typeof v === 'string' || typeof v === 'number').join(' ');
    }

    return 'Abierto - Consultar horarios';
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  if (!lugar || !lugar.nombre) {
    return (
      <View style={estilos.centrado}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={estilos.textoError}>No se pudo encontrar el lugar solicitado.</Text>
        <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
          <Text style={estilos.textoBoton}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const lat = Number(String(lugar.coordenadas?.latitud ?? (lugar.coordenadas as any)?.lat ?? '-32.2230').replace(',', '.'));
  const lng = Number(String(lugar.coordenadas?.longitud ?? (lugar.coordenadas as any)?.lng ?? '-58.1415').replace(',', '.'));

  const fotoLugarUrl = obtenerUrlCompleta(
    (lugar as any).imagenUrl || (lugar as any).imagen || (lugar as any).foto || (lugar as any).fotoUrl || null
  );

  const abrirGoogleMaps = () => {
    const consulta = lugar.direccion
      ? encodeURIComponent(`${lugar.nombre}, ${lugar.direccion}, Entre Ríos, Argentina`)
      : `${lat},${lng}`;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${consulta}`);
  };

  const llamar = () => {
    const telefono = (lugar as any).telefono || (lugar as any).contacto?.telefono || (lugar as any).contacto?.tel;
    if (telefono) {
      const telLimpio = String(telefono).replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${telLimpio}`);
    } else {
      Alert.alert('No disponible', 'Este lugar no tiene un número de teléfono registrado.');
    }
  };

  const abrirWeb = () => {
    const web = (lugar as any).sitioWeb || (lugar as any).web || (lugar as any).contacto?.sitioWeb || (lugar as any).contacto?.web || (lugar as any).url;
    if (web) {
      let urlFinal = String(web).trim();
      if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
        urlFinal = `https://${urlFinal}`;
      }
      Linking.openURL(urlFinal).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el sitio web.');
      });
    } else {
      Alert.alert('No disponible', 'Este lugar no tiene un sitio web registrado.');
    }
  };

  const htmlMapaLocal = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: #E5E7EB; }
          #map { width: 100vw; height: 100vh; }
          .leaflet-control-attribution { display: none; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false, dragging: false }).setView([${lat}, ${lng}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.marker([${lat}, ${lng}]).addTo(map);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={estilos.contenedorPrincipal}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Cabecera */}
        <View style={estilos.imagenHeader}>
          <Pressable style={[estilos.botonFlotante, { left: 16 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </Pressable>

          <Pressable style={[estilos.botonFlotante, { right: 16 }]} onPress={alternarFavorito}>
            {cargandoFavorito ? (
              <ActivityIndicator size="small" color="#E63946" />
            ) : (
              <Ionicons name={esFavorito ? "heart" : "heart-outline"} size={24} color={esFavorito ? "#E63946" : "#1C1C1E"} />
            )}
          </Pressable>

          {fotoLugarUrl ? (
            <Image
              source={{
                uri: fotoLugarUrl,
                headers: {
                  'ngrok-skip-browser-warning': 'true',
                  'User-Agent': 'MiCiudadApp',
                },
              }}
              style={estilos.imagenFondo}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Ionicons name="image-outline" size={60} color="#9CA3AF" />
          )}
        </View>

        {/* Cuerpo */}
        <View style={estilos.cuerpo}>
          <Text style={estilos.nombreLugar}>{String(lugar.nombre)}</Text>

          {/* Horarios Formateados */}
          <View style={estilos.filaDato}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={estilos.textoDato}>
              {formatearHorarios((lugar as any).horario || (lugar as any).horarios)}
            </Text>
          </View>

          {/* Dirección */}
          <View style={estilos.filaDato}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <Text style={estilos.textoDato}>
              {lugar.direccion ? String(lugar.direccion) : 'Ubicación en mapa'}
            </Text>
          </View>

          {/* Mapa de Leaflet */}
          <View style={estilos.contenedorMapa}>
            <WebView
              source={{ html: htmlMapaLocal }}
              style={{ flex: 1 }}
              scrollEnabled={false}
            />
          </View>

          {/* Botón Google Maps */}
          <Pressable style={estilos.botonGoogleMaps} onPress={abrirGoogleMaps}>
            <Ionicons name="navigate-circle" size={22} color="#FFFFFF" />
            <Text style={estilos.textoBotonAzul}>Abrir en Google Maps</Text>
          </Pressable>

          {/* Acciones: Llamar y Web */}
          <View style={estilos.filaAcciones}>
            <Pressable style={estilos.botonAccionMitad} onPress={llamar}>
              <Ionicons name="call-outline" size={20} color="#374151" />
              <Text style={estilos.textoBotonAccion}>Llamar</Text>
            </Pressable>
            <Pressable style={estilos.botonAccionMitad} onPress={abrirWeb}>
              <Ionicons name="globe-outline" size={20} color="#374151" />
              <Text style={estilos.textoBotonAccion}>Sitio web</Text>
            </Pressable>
          </View>

          {/* Audioguía: solo si el lugar tiene */}
          {lugar.audioguia && (
            <ReproductorAudioguia audioguia={lugar.audioguia} titulo={lugar.nombre} />
          )}

          {/* Descripción */}
          <Text style={estilos.tituloSeccion}>Descripción</Text>
          <Text style={estilos.descripcionLugar}>
            {lugar.descripcion ? String(lugar.descripcion) : (lugar.descripcionCorta ? String(lugar.descripcionCorta) : 'No hay información adicional.')}
          </Text>

          {/* Botón Registrar Visita */}
          <Pressable
            style={estilos.botonVisita}
            onPress={() => router.push(`/registro-visita/${id}` as any)}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={estilos.textoBotonVisita}>Registrar Visita</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedorPrincipal: { flex: 1, backgroundColor: '#FFFFFF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  imagenHeader: { height: 280, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  imagenFondo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  botonFlotante: { position: 'absolute', top: 50, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 10, borderRadius: 20, zIndex: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  cuerpo: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 20, minHeight: 600, zIndex: 5 },
  nombreLugar: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16 },
  filaDato: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  textoDato: { fontSize: 15, color: '#5C6B7A', flex: 1 },
  contenedorMapa: { height: 160, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5EA', marginVertical: 16, backgroundColor: '#E5E7EB' },
  botonGoogleMaps: { flexDirection: 'row', backgroundColor: '#0B5394', padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 },
  textoBotonAzul: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  filaAcciones: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  botonAccionMitad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5EA', gap: 8 },
  textoBotonAccion: { fontSize: 15, fontWeight: '600', color: '#374151' },
  tituloSeccion: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  descripcionLugar: { fontSize: 15, color: '#374151', lineHeight: 24, paddingBottom: 24 },
  botonVisita: { flexDirection: 'row', backgroundColor: '#0B5394', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 },
  textoBotonVisita: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  textoError: { fontSize: 16, color: '#374151', marginBottom: 16 },
  botonVolver: { backgroundColor: '#0B5394', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  textoBoton: { color: '#FFFFFF', fontWeight: 'bold' },
});