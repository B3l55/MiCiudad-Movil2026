// src/hooks/useRed.ts
import { useNetworkState } from 'expo-network';

export function useRed() {
  const estado = useNetworkState();

  
  const sinConexion = estado.isConnected === false || estado.isInternetReachable === false;

  return { sinConexion, tipo: estado.type };
}