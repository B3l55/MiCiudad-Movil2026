import { Horario } from '../tipos/lugares';

export interface EstadoApertura {
  abierto: boolean | null; // null = no hay datos de horario
  texto: string;
}

const NOMBRES_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];


const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

const porApertura = (a: Horario, b: Horario) => aMinutos(a.abre) - aMinutos(b.abre);

export const calcularEstadoApertura = (
  horarios: Horario[],
  ahora: Date = new Date()
): EstadoApertura => {
  if (horarios.length === 0) {
    return { abierto: null, texto: 'Horario no disponible' };
  }

  const hoy = ahora.getDay(); 
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const deHoy = horarios.filter((h) => h.dia === hoy);

  //  Está abierto ahora?
  for (const h of deHoy) {
    if (minutosAhora >= aMinutos(h.abre) && minutosAhora < aMinutos(h.cierra)) {
      return { abierto: true, texto: `Abierto ahora · cierra ${h.cierra}` };
    }
  }

  
  const masTarde = deHoy.filter((h) => aMinutos(h.abre) > minutosAhora).sort(porApertura)[0];
  if (masTarde) {
    return { abierto: false, texto: `Cerrado · abre hoy ${masTarde.abre}` };
  }

  
  for (let i = 1; i <= 7; i++) {
    const dia = (hoy + i) % 7;
    const proximo = horarios.filter((h) => h.dia === dia).sort(porApertura)[0];
    if (proximo) {
      const cuando = i === 1 ? 'mañana' : `el ${NOMBRES_DIAS[dia]}`;
      return { abierto: false, texto: `Cerrado · abre ${cuando} ${proximo.abre}` };
    }
  }

  return { abierto: false, texto: 'Cerrado' };
};