/**
 * Context React per gestire le soglie globali
 * NUOVO FILE - Stato Globale Reattivo
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SoglieConfig, caricaSoglie, salvaSoglie, resetSoglie, STORAGE_KEY } from '../utils/configSoglie';

interface SoglieContextType {
  soglie: SoglieConfig;
  aggiornaSoglie: (nuoveSoglie: SoglieConfig) => void;
  resettaSoglie: () => void;
}

const SoglieContext = createContext<SoglieContextType | undefined>(undefined);

/**
 * Provider per rendere le soglie disponibili in tutta l'app
 */
export function SoglieProvider({ children }: { children: ReactNode }) {
  const [soglie, setSoglie] = useState<SoglieConfig>(caricaSoglie());

  // Ascolta i cambiamenti in altre tab/schede del browser
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSoglie(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Errore nel parsing delle soglie da storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * Aggiorna le soglie e le salva nel localStorage
   */
  const aggiornaSoglie = (nuove: SoglieConfig) => {
    setSoglie(nuove);
    salvaSoglie(nuove);
  };

  /**
   * Resetta le soglie ai valori di default
   */
  const resettaSoglie = () => {
    const def = resetSoglie();
    setSoglie(def);
  };

  return (
    <SoglieContext.Provider value={{ soglie, aggiornaSoglie, resettaSoglie }}>
      {children}
    </SoglieContext.Provider>
  );
}

/**
 * Hook personalizzato per accedere alle soglie da qualsiasi componente
 */
export function useSoglie() {
  const context = useContext(SoglieContext);
  if (!context) {
    throw new Error('useSoglie deve essere usato all\'interno di SoglieProvider');
  }
  return context;
}
