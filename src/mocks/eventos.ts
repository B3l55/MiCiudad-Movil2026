import { Evento } from '../tipos/eventos';

const pad = (n: number) => String(n).padStart(2, '0');


const enDias = (dias: number, hora: string): string => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${hora}:00-03:00`;
};

export const eventosMock: Evento[] = [
  
  {
    id: 'evt-001',
    titulo: 'Visita guiada por la costanera',
    descripcion: 'Recorrido a pie por la costanera con historia de la ciudad. Salida frente a Playa Paso Vela.',
    lugarId: null,
    direccionLibre: 'Costanera Gral. Urquiza, frente a Paso Vela',
    coordenadas: { latitud: -32.2201, longitud: -58.1389 },
    inicio: enDias(0, '17:00'),
    fin: enDias(0, '18:30'),
    imagenUrl: null,
    precio: 0,
    estado: 'programado',
  },

  
  {
    id: 'evt-002',
    titulo: 'Peña folclórica en el anfiteatro',
    descripcion: 'Noche de folclore con artistas de la región.',
    lugarId: null,
    direccionLibre: 'Anfiteatro Municipal',
    coordenadas: null,
    inicio: enDias(0, '21:00'),
    fin: enDias(1, '02:00'),
    imagenUrl: null,
    precio: 5000,
    estado: 'programado',
  },

  
  {
    id: 'evt-003',
    titulo: 'Noche termal con música en vivo',
    descripcion: 'Disfrutá de las piscinas termales de noche con música en vivo.',
    lugarId: 'lug-001',
    direccionLibre: null,
    coordenadas: null,
    inicio: enDias(1, '20:00'),
    fin: null,
    imagenUrl: null,
    precio: 12000,
    estado: 'programado',
  },

  
  {
    id: 'evt-004',
    titulo: 'Avistaje de aves en El Palmar',
    descripcion: 'Salida guiada al amanecer para observar aves autóctonas.',
    lugarId: 'lug-004',
    direccionLibre: null,
    coordenadas: null,
    inicio: enDias(2, '07:00'),
    fin: enDias(2, '10:00'),
    imagenUrl: null,
    precio: null,
    estado: 'programado',
  },

  
  {
    id: 'evt-005',
    titulo: 'Recital en el anfiteatro',
    descripcion: 'Suspendido por lluvia. Se reprograma próximamente.',
    lugarId: null,
    direccionLibre: 'Anfiteatro Municipal',
    coordenadas: null,
    inicio: enDias(1, '22:00'),
    fin: null,
    imagenUrl: null,
    precio: 3000,
    estado: 'suspendido',
  },

  
  {
    id: 'evt-006',
    titulo: 'Feria de artesanos',
    descripcion: 'Cancelado por el organizador.',
    lugarId: null,
    direccionLibre: 'Plaza San Martín',
    coordenadas: null,
    inicio: enDias(3, '16:00'),
    fin: enDias(3, '22:00'),
    imagenUrl: null,
    precio: 0,
    estado: 'cancelado',
  },

  
  {
    id: 'evt-007',
    titulo: 'Muestra de fotografía',
    descripcion: 'Muestra de fotografía histórica de la ciudad.',
    lugarId: null,
    direccionLibre: 'Casa de la Cultura',
    coordenadas: null,
    inicio: enDias(-1, '18:00'),
    fin: enDias(-1, '20:00'),
    imagenUrl: null,
    precio: 0,
    estado: 'finalizado',
  },

  
  {
    id: 'evt-008',
    titulo: 'Gran festival regional de música, danza, gastronomía y artesanías de la costa del río Uruguay',
    descripcion: 'Texto larguísimo de prueba para ver cómo se comporta el diseño. '.repeat(15),
    lugarId: null,
    direccionLibre: 'Predio de la Fiesta Nacional de la Artesanía, a metros de la ruta provincial',
    coordenadas: null,
    inicio: enDias(4, '19:00'),
    fin: null,
    imagenUrl: null,
    precio: 8000,
    estado: 'programado',
  },
];