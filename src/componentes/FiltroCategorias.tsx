import Ionicons from '@react-native-vector-icons/ionicons';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Categoria } from '../tipos/categorias';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

interface Props {
  categorias: Categoria[];
  seleccionada: string | null;
  onSeleccionar: (categoriaId: string | null) => void;
}

export default function FiltroCategorias({ categorias, seleccionada, onSeleccionar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.fila}
      style={estilos.scroll}
    >
      <Pressable
        style={[estilos.chip, seleccionada === null && estilos.chipActivo]}
        onPress={() => onSeleccionar(null)}
      >
        <Text style={[estilos.texto, seleccionada === null && estilos.textoActivo]}>Todas</Text>
      </Pressable>

      {categorias.map((cat) => {
        const activa = seleccionada === cat.id;
        return (
          <Pressable
            key={cat.id}
            style={[estilos.chip, activa && { backgroundColor: cat.color, borderColor: cat.color }]}
            onPress={() => onSeleccionar(activa ? null : cat.id)}
          >
            <Ionicons name={cat.icono as NombreIcono} size={18} color={activa ? '#FFF' : cat.color} />
            <Text style={[estilos.texto, activa && estilos.textoActivo]}>{cat.nombre}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flexGrow: 0 },
  fila: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44, 
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipActivo: { backgroundColor: '#0B5394', borderColor: '#0B5394' },
  texto: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  textoActivo: { color: '#FFFFFF' },
});