import * as Network from 'expo-network';
import { visitasServicio } from './visitas';

export const sincronizarVisitasPendientes = async () => {
  try {
    const estadoRed = await Network.getNetworkStateAsync();
    
    
    if (!estadoRed.isConnected || !estadoRed.isInternetReachable) {
      return false;
    }

    
    const pendientes = await visitasServicio.obtenerVisitas();
    const paraSubir = pendientes.filter(v => !v.sincronizada);

    if (paraSubir.length === 0) return true;

    for (const visita of paraSubir) {
      // Acá se conectará el fetch a la API de la cátedra
      // await fetch('https://api.catedra.uner.edu.ar/visitas', { ... })
      
      await visitasServicio.marcarComoSincronizada(visita.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error en sincronización en segundo plano:', error);
    return false;
  }
};