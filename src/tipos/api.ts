export interface MetaPaginacion {
  total: number;
  pagina: number;
  porPagina: number;
}

// Respuesta de éxito de la API
export interface RespuestaPaginada<T> {
  datos: T[];
  meta: MetaPaginacion;
}

// Respuesta de error de la API
export interface RespuestaError {
  error: {
    codigo: string;
    mensaje: string;
  };
}

// Error que lanzan los servicios, para atraparlo en las pantallas
export class ErrorApi extends Error {
  codigo: string;

  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    Object.setPrototypeOf(this, ErrorApi.prototype);
  }
}