// src/utilidades/fotoTemporal.ts
let uriTemporal: string | null = null;

export const guardarFotoTemporal = (uri: string) => {
  uriTemporal = uri;
};

export const obtenerFotoTemporal = (): string | null => {
  const uri = uriTemporal;
  uriTemporal = null; 
  return uri;
};