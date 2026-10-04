/**
 * Configurazione soglie globali per l'analisi
 * NUOVO FILE - Logica e Storage
 */

export interface SoglieConfig {
  positivi: { verde: number; arancione: number };
  negativi: { verde: number; arancione: number };
  errori: { verde: number; arancione: number };
}

export const SOGLIE_DEFAULT: SoglieConfig = {
  positivi: { verde: 60, arancione: 45 },
  negativi: { verde: 10, arancione: 25 },
  errori: { verde: 5, arancione: 15 }
};

export const STORAGE_KEY = 'soglie_config_globali';

/**
 * Carica le soglie dal localStorage
 */
export function caricaSoglie(): SoglieConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SoglieConfig;
    }
  } catch (error) {
    console.error('Errore nel caricamento delle soglie:', error);
  }
  return SOGLIE_DEFAULT;
}

/**
 * Salva le soglie nel localStorage
 */
export function salvaSoglie(soglie: SoglieConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(soglie));
  } catch (error) {
    console.error('Errore nel salvataggio delle soglie:', error);
  }
}

/**
 * Resetta le soglie ai valori di default
 */
export function resetSoglie(): SoglieConfig {
  salvaSoglie(SOGLIE_DEFAULT);
  return SOGLIE_DEFAULT;
}
