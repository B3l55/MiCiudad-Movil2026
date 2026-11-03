// src/utilidades/fotoTemporal.ts
let fotoPendiente: string | null = null;

export const guardarFotoTemporal = (uri: string) => {
  fotoPendiente = uri;
};

// Devuelve la foto y vacía el buzón
export const tomarFotoTemporal = (): string | null => {
  const uri = fotoPendiente;
  fotoPendiente = null;
  return uri;
};