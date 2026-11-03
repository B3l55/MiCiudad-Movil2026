// app/(tabs)/agenda.tsx
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { eventosServicio } from '../../src/servicios/eventos';
import { ErrorApi } from '../../src/tipos/api';
import { Evento } from '../../src/tipos/eventos';
import { claveDia, formatearDia, formatearHora } from '../../src/utilidades/fechas';

interface DiaChip {
  clave: string;
  etiqueta: string;
}

const armarDias = (): DiaChip[] => {
  const dias: DiaChip[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i);
    const etiqueta = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
    dias.push({ clave: claveDia(fecha), etiqueta });
  }
  return dias;
};

const textoPrecio = (precio: number | null) => {
  if (precio === 0) return 'Entrada gratuita';
  if (precio === null) return 'Consultar precio';
  return `$${precio.toLocaleString('es-AR')}`;
};

const textoHorario = (evento: Evento) => {
  const inicio = formatearHora(evento.inicio);
  if (!evento.fin) return `${inicio} hs`;
  const cruzaMedianoche = claveDia(new Date(evento.inicio)) !== claveDia(new Date(evento.fin));
  return `${inicio} a ${formatearHora(evento.fin)} hs${cruzaMedianoche ? ' (día siguiente)' : ''}`;
};

export default function PantallaAgenda() {
  const dias = useMemo(armarDias, []);
  const [diaSeleccionado, setDiaSeleccionado] = useState(dias[0].clave);
  
  const [todosLosEventos, setTodosLosEventos] = useState<Evento[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      const cargarEventos = async () => {
        setCargando(true);
        setError(null);
        try {
          const respuesta = await eventosServicio.obtenerEventos();
          if (!cancelado) {
            
            const lista = respuesta.datos || respuesta;
            setTodosLosEventos(Array.isArray(lista) ? lista : []);
          }
        } catch (err) {
          if (!cancelado) setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar la agenda.');
        } finally {
          if (!cancelado) setCargando(false);
        }
      };
      cargarEventos();
      return () => { cancelado = true; };
    }, [])
  );

  useEffect(() => {
    
    if (!Array.isArray(todosLosEventos)) {
      setEventosFiltrados([]);
      return;
    }
    const filtrados = todosLosEventos.filter(
      evento => evento.inicio && claveDia(new Date(evento.inicio)) === diaSeleccionado
    );
    setEventosFiltrados(filtrados);
  }, [diaSeleccionado, todosLosEventos]);

  const renderAviso = (estado: Evento['estado']) => {
    if (estado === 'cancelado') return (
      <View style={[estilos.aviso, estilos.avisoCancelado]}>
        <Ionicons name="close-circle" size={18} color="#B91C1C" />
        <Text style={[estilos.textoAviso, { color: '#B91C1C' }]}>Evento cancelado</Text>
      </View>
    );
    if (estado === 'suspendido') return (
      <View style={[estilos.aviso, estilos.avisoSuspendido]}>
        <Ionicons name="alert-circle" size={18} color="#B45309" />
        <Text style={[estilos.textoAviso, { color: '#B45309' }]}>Suspendido · se reprograma</Text>
      </View>
    );
    return null;
  };

  const renderEvento = ({ item }: { item: Evento }) => {
    const anulado = item.estado === 'cancelado' || item.estado === 'suspendido';
    return (
      <Pressable style={[estilos.tarjeta, anulado && estilos.tarjetaAnulada]} onPress={() => router.push({ pathname: '/eventos/[id]', params: { id: item.id } })}>
        {renderAviso(item.estado)}
        <Text style={[estilos.titulo, item.estado === 'cancelado' && estilos.tituloTachado]} numberOfLines={3}>{item.titulo}</Text>
        <View style={estilos.filaInfo}>
          <Ionicons name="time-outline" size={18} color="#0B5394" />
          <Text style={estilos.textoHora}>{textoHorario(item)}</Text>
        </View>
        {item.direccionLibre && (
          <View style={estilos.filaInfo}>
            <Ionicons name="location-outline" size={18} color="#5C6B7A" />
            <Text style={estilos.textoInfo} numberOfLines={2}>{item.direccionLibre}</Text>
          </View>
        )}
        <View style={estilos.filaInfo}>
          <Ionicons name="ticket-outline" size={18} color="#5C6B7A" />
          <Text style={estilos.textoInfo}>{textoPrecio(item.precio)}</Text>
        </View>
        <View style={estilos.filaVerDetalle}>
          <Text style={estilos.textoVerDetalle}>Ver detalle</Text>
          <Ionicons name="chevron-forward" size={18} color="#0B5394" />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <View style={estilos.encabezado}>
        <Text style={estilos.tituloPantalla}>Agenda</Text>
        <Text style={estilos.subtitulo}>{formatearDia(diaSeleccionado)}</Text>
      </View>

      <View style={estilos.contenedorDias}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filaDias}>
          {dias.map((dia) => (
            <Pressable key={dia.clave} style={[estilos.chipDia, dia.clave === diaSeleccionado && estilos.chipDiaActivo]} onPress={() => setDiaSeleccionado(dia.clave)}>
              <Text style={[estilos.textoChipDia, dia.clave === diaSeleccionado && estilos.textoChipDiaActivo]}>{dia.etiqueta}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {cargando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#0B5394" />
        </View>
      ) : (
        <FlatList
          data={eventosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderEvento}
          contentContainerStyle={estilos.lista}
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <Ionicons name={error ? 'cloud-offline-outline' : 'calendar-clear-outline'} size={48} color="#9CA3AF" />
              <Text style={estilos.textoVacio}>{error ?? 'No hay eventos para este día.'}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F2F2F7' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  encabezado: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  tituloPantalla: { fontSize: 22, fontWeight: 'bold', color: '#0B5394' },
  subtitulo: { fontSize: 15, color: '#5C6B7A', marginTop: 2, textTransform: 'capitalize' },
  contenedorDias: { backgroundColor: '#FFFFFF', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  filaDias: { paddingHorizontal: 16, gap: 8 },
  chipDia: { minHeight: 44, minWidth: 64, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderRadius: 22, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#D1D5DB' },
  chipDiaActivo: { backgroundColor: '#0B5394', borderColor: '#0B5394' },
  textoChipDia: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  textoChipDiaActivo: { color: '#FFFFFF' },
  lista: { padding: 16, gap: 12, flexGrow: 1 },
  tarjeta: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', gap: 8 },
  tarjetaAnulada: { backgroundColor: '#FAFAFA', borderColor: '#D1D5DB' },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  tituloTachado: { textDecorationLine: 'line-through', color: '#6B7280' },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  avisoCancelado: { backgroundColor: '#FEE2E2' },
  avisoSuspendido: { backgroundColor: '#FEF3C7' },
  textoAviso: { fontSize: 14, fontWeight: 'bold' },
  filaInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoHora: { fontSize: 16, fontWeight: '600', color: '#0B5394' },
  textoInfo: { fontSize: 15, color: '#4B5563', flex: 1 },
  filaVerDetalle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  textoVerDetalle: { fontSize: 15, fontWeight: '600', color: '#0B5394' },
  vacio: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 32 },
  textoVacio: { marginTop: 12, textAlign: 'center', color: '#6B7280', fontSize: 16, lineHeight: 22 },
});