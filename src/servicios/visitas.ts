// src/servicios/visitas.ts
import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { fetch as fetchExpo } from 'expo/fetch';

import { BASE_URL } from '../config/api';
import {
  borrarPendiente,
  guardarPendiente,
  leerPendientes,
  sumarIntento,
  VisitaPendiente,
} from '../db/colaVisitas';

// Después de este número de rechazos de la API, la visita deja de reintentarse
const MAX_INTENTOS = 5;


class ErrorRechazo extends Error {
  status: number;
  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

async function obtenerHeaders(esJson = true) {
  const token = await SecureStore.getItemAsync('token_sesion');
  const headers: any = {};
  if (esJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// 
async function leerError(respuesta: Response, textoPorDefecto: string): Promise<Error> {
  const cuerpo = await respuesta.json().catch(() => null);
  console.log('Error de la API →', respuesta.status, JSON.stringify(cuerpo));
  return new Error(`(${respuesta.status}) ${cuerpo?.error?.mensaje ?? textoPorDefecto}`);
}

// 
const copiarFotoAlTelefono = async (uriOrigen: string, idVisita: string): Promise<string> => {
  try {
    const carpeta = new Directory(Paths.document, 'visitas');
    carpeta.create({ intermediates: true, idempotent: true });
    const origen = new File(uriOrigen);
    const destino = new File(carpeta, `${idVisita}${origen.extension || '.jpg'}`);
    await origen.copy(destino);
    return destino.uri;
  } catch (error) {
    console.log('No se pudo copiar la foto a la carpeta de la app:', error);
    return uriOrigen;
  }
};

const borrarFotoLocal = (uri: string | null) => {
  if (!uri) return;
  try {
    const archivo = new File(uri);
    if (archivo.exists) archivo.delete();
  } catch {
    // 
  }
};

// POST /archivos -> devuelve la url de la foto subida
const subirFoto = async (uriLocal: string): Promise<string> => {
  const formData = new FormData();
  formData.append('archivo', new File(uriLocal));

  const token = await SecureStore.getItemAsync('token_sesion');
  const respuesta = await fetchExpo(`${BASE_URL}/archivos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const json: any = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorRechazo(respuesta.status, json?.error?.mensaje ?? 'No se pudo subir la foto');
  }
  const url = json?.datos?.url ?? json?.datos?.clave;
  if (!url) throw new ErrorRechazo(422, 'El servidor no devolvió la dirección de la foto');
  return url;
};

// Sube una visita pendiente: primero la foto (si tiene) y después la visita
const subirPendiente = async (visita: VisitaPendiente): Promise<void> => {
  let fotoUri: string | null = null;
  if (visita.fotoLocal && new File(visita.fotoLocal).exists) {
    fotoUri = await subirFoto(visita.fotoLocal);
  }

  const headers = await obtenerHeaders(true);
  // 
  const respuesta = await fetch(`${BASE_URL}/yo/visitas`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: visita.id,
      lugarId: visita.lugarId,
      fechaHora: visita.fechaHora,
      origen: visita.origen,
      fotoUri,
      nota: visita.nota,
      sincronizada: true,
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    throw new ErrorRechazo(respuesta.status, cuerpo?.error?.mensaje ?? 'La API rechazó la visita');
  }
};

let sincronizando = false;

// 
export const sincronizarVisitasPendientes = async (): Promise<number> => {
  if (sincronizando) return 0; 
  sincronizando = true;
  let subidas = 0;

  try {
    const pendientes = (await leerPendientes()).filter((visita) => visita.intentos < MAX_INTENTOS);

    for (const visita of pendientes) {
      try {
        await subirPendiente(visita);
        await borrarPendiente(visita.id);
        borrarFotoLocal(visita.fotoLocal);
        subidas++;
      } catch (error) {
        const rechazo = error instanceof ErrorRechazo ? error : null;
        
        if (!rechazo || rechazo.status === 401 || rechazo.status >= 500) {
          console.log('Subida de visitas en pausa:', rechazo ? `(${rechazo.status}) ${rechazo.message}` : 'sin conexión');
          break;
        }
        
        console.log('Visita rechazada por la API:', visita.id, rechazo.message);
        await sumarIntento(visita.id);
      }
    }
  } finally {
    sincronizando = false;
  }

  if (subidas > 0) console.log('Visitas pendientes subidas:', subidas);
  return subidas;
};

export const visitasServicio = {
  // GET /yo/visitas -> 
  obtenerVisitas: async (): Promise<any[]> => {
    try {
      const headers = await obtenerHeaders(true);
      const respuesta = await fetch(`${BASE_URL}/yo/visitas`, { method: 'GET', headers });

      if (!respuesta.ok) return [];

      const json = await respuesta.json();
      const lista = json.datos || json;
      return Array.isArray(lista) ? lista : [];
    } catch (error) {
      console.error('Error al cargar recorrido:', error);
      return [];
    }
  },

  
  registrarVisita: async (datos: {
    lugarId: string;
    origen: 'qr' | 'gps' | 'manual';
    nota?: string | null;
    fotoLocalUri?: string | null;
  }): Promise<{ id: string; sincronizada: boolean }> => {
    const id = `vis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const fotoLocal = datos.fotoLocalUri ? await copiarFotoAlTelefono(datos.fotoLocalUri, id) : null;

    await guardarPendiente({
      id,
      lugarId: datos.lugarId,
      origen: datos.origen,
      fechaHora: new Date().toISOString(),
      nota: datos.nota ?? null,
      fotoLocal,
    });
    console.log('Visita guardada en el teléfono:', id);

    await sincronizarVisitasPendientes();

    
    const sigueEnCola = (await leerPendientes()).some((visita) => visita.id === id);
    return { id, sincronizada: !sigueEnCola };
  },

  // PATCH /yo/visitas/:id 
  actualizarVisita: async (idVisita: string, datos: { nota?: string; foto?: string }) => {
    const headers = await obtenerHeaders(true);

    const payloadLimpio = {
      nota: datos.nota,
      fotoUri: datos.foto,
    };

    const respuesta = await fetch(`${BASE_URL}/yo/visitas/${idVisita}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payloadLimpio),
    });

    if (!respuesta.ok) throw await leerError(respuesta, 'Error al actualizar la visita');
    return await respuesta.json();
  },
};