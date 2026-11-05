// app/eventos/[id].tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { eventosServicio } from '../../src/servicios/eventos';
import { eventosGuardadosServicio } from '../../src/servicios/eventosGuardados';
import { lugaresServicio } from '../../src/servicios/lugares';
import { usuarioServicio } from '../../src/servicios/usuario';
import { ErrorApi } from '../../src/tipos/api';
import { Evento } from '../../src/tipos/eventos';
import { Lugar } from '../../src/tipos/lugares';
import { claveDia, formatearDia, formatearHora } from '../../src/utilidades/fechas';

const textoHorario = (evento: any) => {
  const inicioFecha = evento.inicio || evento.fechaInicio || evento.fecha;
  if (!inicioFecha) return 'Horario a confirmar';

  const inicio = formatearHora(inicioFecha);
  const finFecha = evento.fin || evento.fechaFin;
  if (!finFecha) return `${inicio} hs`;

  const cruzaMedianoche = claveDia(new Date(inicioFecha)) !== claveDia(new Date(finFecha));
  return `${inicio} a ${formatearHora(finFecha)} hs${cruzaMedianoche ? ' (día siguiente)' : ''}`;
};

const textoPrecio = (precio: number | null | undefined) => {
  if (precio === 0) return 'Entrada libre y gratuita';
  if (precio == null) return 'Consultar precio';
  return `Valor de la entrada: $${precio.toLocaleString('es-AR')}`;
};

const MENSAJES_ESTADO: Record<string, string> = {
  cancelado: 'Este evento fue cancelado.',
  suspendido: 'Este evento fue suspendido. Se reprograma.',
  finalizado: 'Este evento ya finalizó.',
};

export default function DetalleEvento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [evento, setEvento] = useState<any | null>(null);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  // Estado para saber si es Turismo
  const [esAdmin, setEsAdmin] = useState(false);
  const [procesandoAdmin, setProcesandoAdmin] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        // Le pedimos el perfil real al backend para asegurar que lea el email exacto
        const perfil = await usuarioServicio.obtenerPerfil().catch(() => null);
        if (perfil && perfil.email === 'turismo@colon.demo.ar') {
          setEsAdmin(true);
        }

        const respuesta: any = await eventosServicio.obtenerEventoPorId(id);
        const e = respuesta.datos || respuesta;
        setEvento(e);

        if (id) {
          const estadoGuardado = await eventosGuardadosServicio.esGuardado(String(id));
          setGuardado(estadoGuardado);
        }

        const lugarIdBuscado = e.lugarId || e.lugar?.id;
        if (lugarIdBuscado) {
          try {
            const resLugar: any = await lugaresServicio.obtenerLugarPorId(lugarIdBuscado);
            setLugar(resLugar.datos || resLugar);
          } catch {}
        }
      } catch (err) {
        setError(err instanceof ErrorApi ? err.message : 'Ocurrió un error inesperado.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const toggleGuardar = async () => {
    if (!id) return;
    try {
      const nuevoEstado = await eventosGuardadosServicio.alternarGuardado(String(id));
      setGuardado(nuevoEstado);
    } catch (e) {
      console.log('Error guardando evento', e);
    }
  };

  // Maneja los botones de administración de Turismo
  const cambiarEstadoAdmin = async (nuevoEstado: 'programado' | 'suspendido' | 'cancelado') => { 
    const accion = nuevoEstado === 'cancelado' ? 'Cancelar' : nuevoEstado === 'suspendido' ? 'Suspender' : 'Reprogramar'; 
    Alert.alert(
      `¿${accion} evento?`, 
      nuevoEstado === 'programado' 
        ? 'El evento vuelve a estar programado y se avisa a quienes lo guardaron.'
        : `Estás por marcar el evento como ${nuevoEstado}. Esta acción será visible para todos los usuarios.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, confirmar',
          style: nuevoEstado === 'programado' ? 'default' : 'destructive', 
          onPress: async () => {
            setProcesandoAdmin(true);
            try {
              await eventosServicio.actualizarEstado(String(id), nuevoEstado);
              
              setEvento((prev: any) => ({ ...prev, estado: nuevoEstado }));
              Alert.alert('Éxito', `Evento marcado como ${nuevoEstado}.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo actualizar el estado.');
            } finally {
              setProcesandoAdmin(false);
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0B5394" />
      </View>
    );
  }

  if (error || !evento) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={estilos.textoError}>{error ?? 'Evento no encontrado.'}</Text>
        <Pressable style={estilos.botonVolverTexto} onPress={() => router.back()}>
          <Text style={estilos.textoBotonAzul}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const estado = evento.estado || 'programado';
  const avisoEstado = MENSAJES_ESTADO[estado] ?? null;
  const anulado = estado === 'cancelado' || estado === 'suspendido';
  const puedeGuardar = estado === 'programado';

  const titulo = evento.titulo || evento.nombre || 'Evento sin título';
  const descripcion = evento.descripcion || evento.descripcionCorta || 'No hay descripción disponible para este evento.';
  const precio = evento.precio !== undefined ? evento.precio : (evento.costo !== undefined ? evento.costo : null);
  const inicioFecha = evento.inicio || evento.fechaInicio || evento.fecha;

  const textoUbicacion = lugar
    ? `${lugar.nombre}${lugar.direccion ? ` · ${lugar.direccion}` : ''}`
    : (evento.direccionLibre || evento.ubicacion || evento.lugarNombre || 'Ubicación a confirmar');

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[estilos.headerFlotante, { top: insets.top + 10 }]}>
        <Pressable style={estilos.botonVolverFlotante} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </Pressable>
      </View>

      <ScrollView
        style={estilos.contenido}
        contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: 40 }}
      >
        {avisoEstado && (
          <View style={[estilos.alerta, anulado ? estilos.alertaAnulado : estilos.alertaInfo]}>
            <Ionicons name="warning" size={24} color={anulado ? '#B91C1C' : '#4B5563'} />
            <Text style={[estilos.textoAlerta, { color: anulado ? '#B91C1C' : '#4B5563' }]}>
              {avisoEstado}
            </Text>
          </View>
        )}

        <Text style={[estilos.titulo, anulado && { color: '#6B7280' }]}>{titulo}</Text>

        <View style={estilos.cajaDestacada}>
          <View style={estilos.filaDestacada}>
            <Ionicons name="calendar-outline" size={24} color="#0B5394" />
            <View style={{ flex: 1 }}>
              <Text style={estilos.etiquetaDestacada}>Día y horario</Text>
              <Text style={[estilos.valorDestacado, { textTransform: 'capitalize' }]}>
                {inicioFecha ? formatearDia(claveDia(new Date(inicioFecha))) : 'Fecha a confirmar'}
              </Text>
              <Text style={estilos.valorDestacado}>{textoHorario(evento)}</Text>
            </View>
          </View>

          <View style={estilos.divisor} />

          <View style={estilos.filaDestacada}>
            <Ionicons name="location-outline" size={24} color="#0B5394" />
            <View style={{ flex: 1 }}>
              <Text style={estilos.etiquetaDestacada}>Ubicación</Text>
              <Text style={estilos.valorDestacado}>{textoUbicacion}</Text>
            </View>
          </View>
        </View>

        {(evento.lugarId || lugar?.id) && (
          <Pressable
            style={estilos.botonVerLugar}
            onPress={() => router.push({ pathname: '/lugares/[id]', params: { id: lugar?.id || evento.lugarId } })}
          >
            <Text style={estilos.textoVerLugar}>Ver {lugar?.nombre || 'Lugar'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#0B5394" />
          </Pressable>
        )}

        <Text style={estilos.subtitulo}>Sobre el evento</Text>
        <Text style={estilos.descripcion}>{descripcion}</Text>

        <View style={estilos.filaInfoExtra}>
          <Ionicons name="ticket-outline" size={20} color="#0B5394" />
          <Text style={estilos.textoInfoExtra}>{textoPrecio(precio)}</Text>
        </View>

        {/* Panel de Administración Exclusivo para Turismo */}
        {esAdmin && estado !== 'cancelado' && estado !== 'finalizado' && ( 
          <View style={estilos.panelAdmin}>
            <Text style={estilos.tituloAdmin}>Acciones de Turismo</Text>
            <View style={estilos.filaBotonesAdmin}>
              {estado === 'suspendido' ? ( 
                <Pressable
                  style={[estilos.botonAdmin, estilos.botonReprogramar, procesandoAdmin && estilos.botonDeshabilitado]}
                  onPress={() => cambiarEstadoAdmin('programado')}
                  disabled={procesandoAdmin}
                >
                  <Ionicons name="play-circle-outline" size={20} color="#166534" />
                  <Text style={estilos.textoBotonReprogramar}>Reprogramar</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[estilos.botonAdmin, estilos.botonSuspender, procesandoAdmin && estilos.botonDeshabilitado]}
                  onPress={() => cambiarEstadoAdmin('suspendido')}
                  disabled={procesandoAdmin}
                >
                  <Ionicons name="pause-circle-outline" size={20} color="#9A3412" />
                  <Text style={estilos.textoBotonSuspender}>Suspender</Text>
                </Pressable>
              )}

              <Pressable
                style={[estilos.botonAdmin, estilos.botonCancelar, procesandoAdmin && estilos.botonDeshabilitado]}
                onPress={() => cambiarEstadoAdmin('cancelado')}
                disabled={procesandoAdmin}
              >
                <Ionicons name="close-circle-outline" size={20} color="#991B1B" />
                <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {puedeGuardar && (
        <View style={[estilos.pieFijo, { paddingBottom: insets.bottom || 20 }]}>
          <Pressable
            style={[estilos.botonGuardar, guardado && estilos.botonGuardado]}
            onPress={toggleGuardar}
          >
            <Ionicons
              name={guardado ? 'checkmark-circle' : 'bookmark-outline'}
              size={22}
              color={guardado ? '#2E7D32' : '#FFFFFF'}
            />
            <Text style={[estilos.textoBotonGuardar, guardado && { color: '#2E7D32' }]}>
              {guardado ? 'Evento guardado' : 'Guardar evento'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FFFFFF' },
  centrado: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoError: { fontSize: 16, color: '#4B5563', marginBottom: 20, textAlign: 'center' },
  botonVolverTexto: { padding: 12, backgroundColor: '#EBF3FB', borderRadius: 8 },
  textoBotonAzul: { color: '#0B5394', fontWeight: 'bold' },

  headerFlotante: { position: 'absolute', left: 16, zIndex: 10 },
  botonVolverFlotante: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenido: { flex: 1, paddingHorizontal: 20 },

  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertaAnulado: { backgroundColor: '#FEE2E2' },
  alertaInfo: { backgroundColor: '#F3F4F6' },
  textoAlerta: { flex: 1, fontWeight: 'bold', fontSize: 15 },

  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 24 },
  cajaDestacada: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  filaDestacada: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  etiquetaDestacada: { fontSize: 13, color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  valorDestacado: { fontSize: 16, color: '#1C1C1E', fontWeight: 'bold', marginTop: 2 },
  divisor: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16, marginLeft: 40 },

  botonVerLugar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    marginBottom: 24,
    backgroundColor: '#EBF3FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B9D5F0',
  },
  textoVerLugar: { fontSize: 16, fontWeight: '600', color: '#0B5394' },

  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  descripcion: { fontSize: 16, lineHeight: 24, color: '#4B5563', marginBottom: 24 },
  filaInfoExtra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#EBF3FB',
    borderRadius: 12,
  },
  textoInfoExtra: { fontSize: 15, fontWeight: '600', color: '#0B5394', flex: 1 },

  pieFijo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  botonGuardar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    backgroundColor: '#0B5394',
    borderRadius: 12,
  },
  botonGuardado: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' },
  textoBotonGuardar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  // Estilos del panel de Turismo
  panelAdmin: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  tituloAdmin: { fontSize: 14, fontWeight: 'bold', color: '#991B1B', marginBottom: 12, textTransform: 'uppercase' },
  filaBotonesAdmin: { flexDirection: 'row', gap: 12 },
  botonAdmin: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  botonSuspender: { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' },
  textoBotonSuspender: { color: '#9A3412', fontWeight: 'bold', fontSize: 14 },
  botonCancelar: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  textoBotonCancelar: { color: '#991B1B', fontWeight: 'bold', fontSize: 14 },
  botonReprogramar: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }, 
  textoBotonReprogramar: { color: '#166534', fontWeight: 'bold', fontSize: 14 }, 
  botonDeshabilitado: { opacity: 0.5 },
});