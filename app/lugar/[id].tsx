// app/lugar/[id].tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { lugaresServicio } from '../../src/servicios/lugares';
import { Lugar } from '../../src/tipos/lugares';


export default function DetalleLugar(){
    // Capturamos el parámetro 'id' que viene en la URL de la ruta dinámica
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Buscamos el detalle del lugar específico cuando la pantalla se monta
  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        if (!id) return;
        const resultado = await lugaresServicio.obtenerLugarPorId(id);
        if (resultado) {
          setLugar(resultado);
        } else {
          setError("No se encontró el lugar solicitado.");
        }
      } catch (err) {
        setError("Error al cargar la información del lugar.");
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <ActivityIndicator size="large" color="#0B5394" />
        <Text style={estilos.textoMensaje}>Cargando detalle...</Text>
      </View>
    );
  }

  if (error || !lugar) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <Text style={estilos.textoError}>{error || "Lugar no encontrado."}</Text>
        <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
          <Text style={estilos.textoBotonVolver}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Configuramos dinámicamente el header de la pantalla con Expo Router */}
      <Stack.Screen 
        options={{ 
          title: lugar.nombre,
          headerStyle: { backgroundColor: '#0B5394' },
          headerTintColor: '#fff',
        }} 
      />

      <ScrollView contentContainerStyle={estilos.scroll}>
        
        {/* Imagen o banner representativo */}
        <View style={estilos.cajaImagen}>
          <Ionicons name="image-outline" size={48} color="#8E99A4" />
          <Text style={estilos.textoImagen}>Fotografía del lugar</Text>
        </View>

        {/* Información Principal */}
        <View style={estilos.seccion}>
          <Text style={estilos.titulo}>{lugar.nombre}</Text>
          <Text style={estilos.direccion}>{lugar.direccion}</Text>
          
          <View style={estilos.filaEtiquetas}>
            <View style={estilos.etiqueta}>
              <Text style={estilos.textoEtiqueta}>
                {lugar.precioEntrada === 0 ? "Gratis" : `$ ${lugar.precioEntrada}`}
              </Text>
            </View>
            <View style={[estilos.etiqueta, lugar.accesible ? estilos.accVerde : estilos.accGris]}>
              <Text style={estilos.textoEtiqueta}>
                {lugar.accesible ? "Accesible" : "No accesible"}
              </Text>
            </View>
          </View>

          <Text style={estilos.descripcion}>{lugar.descripcion}</Text>
        </View>

        {/* Reproductor de Audioguía (Requisito multimedia del PRD) */}
        {lugar.audioguia && (
          <View style={estilos.cajaAudio}>
            <View>
              <Text style={estilos.tituloAudio}>Audioguía disponible</Text>
              <Text style={estilos.subAudio}>Duración: {Math.floor(lugar.audioguia.duracionSegundos / 60)} min</Text>
            </View>
            <Pressable 
              style={estilos.botonAudio} 
              onPress={() => alert("Reproduciendo audioguía...")}
              role="button"
              accessibilityLabel="Escuchar audioguía"
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={estilos.textoBotonAudio}>Escuchar</Text>
            </Pressable>
          </View>
        )}

        {/* Botones de acción inferior */}
        <View style={estilos.acciones}>
          <Pressable 
            style={estilos.botonAccion} 
            onPress={() => alert("Abriendo mapas...")}
            role="button"
          >
            <Ionicons name="navigate-outline" size={20} color="#0B5394" />
            <Text style={estilos.textoAccion}>Cómo llegar</Text>
          </Pressable>

          <Pressable 
            style={estilos.botonAccionPrimario} 
            onPress={() => alert("Visita registrada")}
            role="button"
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={estilos.textoAccionPrimario}>Registrar visita</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centrado: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scroll: {
    paddingBottom: 32,
  },
  cajaImagen: {
    height: 220,
    backgroundColor: '#E3E6EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoImagen: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  seccion: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  direccion: {
    fontSize: 14,
    color: '#5C6B7A',
    marginBottom: 12,
  },
  filaEtiquetas: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  etiqueta: {
    backgroundColor: '#EBF3FB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accVerde: {
    backgroundColor: '#E1F5FE',
  },
  accGris: {
    backgroundColor: '#F1F5F9',
  },
  textoEtiqueta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B5394',
  },
  descripcion: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  cajaAudio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0B5394',
  },
  tituloAudio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  subAudio: {
    fontSize: 13,
    color: '#5C6B7A',
    marginTop: 2,
  },
  botonAudio: {
    flexDirection: 'row',
    backgroundColor: '#0B5394',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  textoBotonAudio: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  acciones: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0B5394',
    gap: 6,
  },
  textoAccion: {
    color: '#0B5394',
    fontWeight: '600',
  },
  botonAccionPrimario: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  textoAccionPrimario: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textoMensaje: {
    marginTop: 12,
    color: '#5C6B7A',
  },
  textoError: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  botonVolver: {
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBotonVolver: {
    color: '#FFFFFF',
  },
});



