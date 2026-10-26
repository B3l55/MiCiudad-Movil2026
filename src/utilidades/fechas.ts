const pad = (n: number) => String(n).padStart(2, '0');

// Date -> "2026-10-14". Sirve para agrupar y comparar eventos por día
export const claveDia = (fecha: Date): string =>
  `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;

// "2026-11-14T21:00:00-03:00" -> "21:00"
export const formatearHora = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// "2026-10-14" -> "miércoles 14 de octubre"
export const formatearDia = (clave: string): string => {
  // Al mediodía, para que ningún huso horario corra el día
  const d = new Date(`${clave}T12:00:00`);
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
};