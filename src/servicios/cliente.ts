// src/servicios/cliente.ts
import * as SecureStore from 'expo-secure-store';


import { BASE_URL } from '../config/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const token = await SecureStore.getItemAsync('token_sesion');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}${endpoint}`;
    console.log(`[HTTP ${options.method || 'GET'}] -> ${url}`);

    const respuesta = await fetch(url, { ...options, headers });

    if (!respuesta.ok) {
      const textoError = await respuesta.text();
      console.error(` [ERROR API ${respuesta.status}] en ${endpoint}:`, textoError);
      throw new Error(`Error ${respuesta.status}`);
    }

    const json = await respuesta.json();
    return json;
  } catch (error) {
    console.error(` [ERROR DE CONEXIÓN] en ${endpoint}:`, error);
    throw error;
  }
}