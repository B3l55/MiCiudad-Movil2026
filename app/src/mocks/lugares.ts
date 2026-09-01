// src/mocks/lugares.ts
import { Lugar } from '../tipos/lugares';

export const lugaresMock: Lugar[] = [
  {
    id: "lug-001",
    nombre: "Termas de Colón",
    categoriaId: "cat-termas",
    descripcionCorta: "Complejo termal con piscinas frente al río Uruguay.",
    descripcion: "Complejo termal con piscinas cubiertas y al aire libre frente al río Uruguay...",
    coordenadas: { latitud: -32.2132, longitud: -58.1368 },
    direccion: "Saboy y, Ruta 135",
    imagenes: ["https://ejemplo.com/foto-termas1.jpg"],
    horarios: [
      { dia: 1, abre: "09:00", cierra: "20:00" },
      { dia: 2, abre: "09:00", cierra: "20:00" },
      // ... agregar los demás días
    ],
    telefono: "3447-424717",
    sitioWeb: null,
    precioEntrada: 6000,
    audioguia: null,
    codigoQr: "COLON:lug-001",
    accesible: true,
    activo: true,
    actualizadoEn: "2026-08-01T10:30:00-03:00"
  },
  // Acá podés agregar Playa Paso Vela y el Museo con este mismo formato exacto...
];