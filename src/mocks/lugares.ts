import { Horario, Lugar } from '../tipos/lugares';

// Ayuda: horario igual los 7 días (0 = domingo ... 6 = sábado)
const todosLosDias = (abre: string, cierra: string): Horario[] =>
  ([0, 1, 2, 3, 4, 5, 6] as const).map((dia) => ({ dia, abre, cierra }));

export const lugaresMock: Lugar[] = [
  // Caso normal, completo
  {
    id: "lug-001",
    nombre: "Termas de Colón",
    categoriaId: "cat-termas",
    descripcionCorta: "Complejo termal con piscinas frente al río Uruguay.",
    descripcion: "Complejo termal con piscinas cubiertas y al aire libre frente al río Uruguay. Entrada general (a partir de 11 años $20.000), menores de 3 a 10 años $6.000, menores de 2 años gratis, jubilados $8.000, personas con discapacidad (CUD y DNI) gratis, residentes locales $10.000.",
    coordenadas: { latitud: -32.2132, longitud: -58.1368 },
    direccion: "Batalla de Cepeda 100",
    imagenes: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW1NgdFJecUsxAIUXWOjqlHrnVm_FJ30ippgoE8t2JNw&s=10"],
    horarios: todosLosDias("09:00", "20:00"),
    telefono: "3447-424717",
    sitioWeb: null,
    precioEntrada: 20000,
    audioguia: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duracionSegundos: 372,
      idioma: "es",
    },
    codigoQr: "COLON:lug-001",
    accesible: true,
    activo: true,
    actualizadoEn: "2026-08-01T10:30:00-03:00",
  },

  // Feo 1: cierra los lunes (no hay horario para el día 1) y no es accesible
  {
    id: "lug-002",
    nombre: "Molino Forclaz",
    categoriaId: "cat-museos",
    descripcionCorta: "Molino de viento de 1888 levantado por colonos suizos.",
    descripcion: "Construido en 1888 por Juan Bautista Forclaz, colono suizo. Conserva la maquinaria original.",
    coordenadas: { latitud: -32.1904, longitud: -58.1932 },
    direccion: "Colonia San José, Ruta Provincial 26",
    imagenes: ["https://api.colon.tur.ar/img/molino-1.jpg"],
    horarios: [
      { dia: 0, abre: "10:00", cierra: "19:00" },
      { dia: 2, abre: "09:00", cierra: "19:00" },
      { dia: 3, abre: "09:00", cierra: "19:00" },
      { dia: 4, abre: "09:00", cierra: "19:00" },
      { dia: 5, abre: "09:00", cierra: "19:00" },
      { dia: 6, abre: "10:00", cierra: "20:00" },
    ],
    telefono: "345-4421234",
    sitioWeb: null,
    precioEntrada: 1500,
    audioguia: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duracionSegundos: 252,
      idioma: "es",
    },
    codigoQr: "COLON:lug-002",
    accesible: false,
    activo: true,
    actualizadoEn: "2026-08-01T10:30:00-03:00",
  },

  // Feo 2: sin audioguía, sin teléfono, sin web, gratis
  {
    id: "lug-003",
    nombre: "Playa Paso Vela",
    categoriaId: "cat-playas",
    descripcionCorta: "Playa de arena sobre el río Uruguay.",
    descripcion: "Playa pública con servicios de gastronomía en temporada.",
    coordenadas: { latitud: -32.2201, longitud: -58.1389 },
    direccion: "Costanera Gral. Urquiza",
    imagenes: ["https://api.colon.tur.ar/img/paso-vela.jpg"],
    horarios: todosLosDias("00:00", "23:59"),
    telefono: null,
    sitioWeb: null,
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: true,
    activo: true,
    actualizadoEn: "2026-08-01T10:30:00-03:00",
  },

  // Feo 3: texto larguísimo, sin imágenes, sin horarios, precio null
  {
    id: "lug-004",
    nombre: "Parque Nacional El Palmar con un nombre exageradamente largo para probar el diseño",
    categoriaId: "cat-naturaleza",
    descripcionCorta: "Reserva de palmeras yatay. " + "Texto largo de prueba. ".repeat(12),
    descripcion: "Texto larguísimo de prueba para ver cómo se comporta el scroll. ".repeat(40),
    coordenadas: { latitud: -31.8667, longitud: -58.2333 },
    direccion: "Ruta Nacional 14, km 199",
    imagenes: [],
    horarios: [],
    telefono: "3447-493053",
    sitioWeb: "https://www.argentina.gob.ar/parquesnacionales/elpalmar",
    precioEntrada: null,
    audioguia: null,
    codigoQr: "COLON:lug-004",
    accesible: false,
    activo: true,
    actualizadoEn: "2026-08-01T10:30:00-03:00",
  },

  // Feo 4: dado de baja (activo: false) -> no tendría que mostrarse
  {
    id: "lug-005",
    nombre: "Casa de la Cultura (cerrada por obras)",
    categoriaId: "cat-museos",
    descripcionCorta: "Museo y centro cultural en el casco histórico.",
    descripcion: "Cerrada temporalmente por refacciones.",
    coordenadas: { latitud: -32.2245, longitud: -58.142 },
    direccion: "Av. 12 de Abril 200",
    imagenes: [],
    horarios: [],
    telefono: "3447-421234",
    sitioWeb: null,
    precioEntrada: 0,
    audioguia: null,
    codigoQr: "COLON:lug-005",
    accesible: true,
    activo: false,
    actualizadoEn: "2026-08-01T10:30:00-03:00",
  },
];