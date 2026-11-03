import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
  return <Text style={[estilos.default, style]} {...rest} />;
}

const estilos = StyleSheet.create({
  default: { fontSize: 16, color: '#1C1C1E' },
});