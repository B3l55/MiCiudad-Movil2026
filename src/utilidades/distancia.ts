// src/utilidades/distancia.ts
import { Coordenadas } from '../tipos/lugares';

const RADIO_TIERRA_METROS = 6371000;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;


export const distanciaMetros = (a: Coordenadas, b: Coordenadas): number => {
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLng = aRadianes(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.latitud)) * Math.cos(aRadianes(b.latitud)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_METROS * Math.asin(Math.sqrt(h));
};


export const formatearDistancia = (metros: number): string => {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} km`;
};