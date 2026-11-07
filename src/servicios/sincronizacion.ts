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
      
      
      await visitasServicio.marcarComoSincronizada(visita.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error en sincronización en segundo plano:', error);
    return false;
  }
};