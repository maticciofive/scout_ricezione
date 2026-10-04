/**
 * Logica pura per valutare i colori in base alle soglie
 * NUOVO FILE - Funzioni di valutazione
 */

import { SoglieConfig } from './configSoglie';

export type TipoEsito = 'positivo' | 'negativo' | 'errore';
export type StatoColore = 'verde' | 'arancione' | 'rosso' | 'neutro';

/**
 * Determina il colore in base al tipo di esito e alla percentuale
 * 
 * @param tipo - Tipo di esito (positivo, negativo, errore)
 * @param percentuale - Valore percentuale da valutare
 * @param soglie - Configurazione delle soglie
 * @returns StatoColore - Il colore da applicare
 * 
 * Logica:
 * - Positivi: più alto è meglio (verde ≥ X, arancione ≥ Y, rosso < Y)
 * - Negativi: più basso è meglio (verde ≤ X, arancione ≤ Y, rosso > Y)
 * - Errori: più basso è meglio (verde ≤ X, arancione ≤ Y, rosso > Y)
 */
export function getStatoColore(
  tipo: TipoEsito,
  percentuale: number,
  soglie: SoglieConfig
): StatoColore {
  if (percentuale === 0) return 'neutro';

  if (tipo === 'positivo') {
    // Più alto è meglio
    const s = soglie.positivi;
    if (percentuale >= s.verde) return 'verde';
    if (percentuale >= s.arancione) return 'arancione';
    return 'rosso';
  } else if (tipo === 'negativo') {
    // Negativi: più basso è meglio
    const s = soglie.negativi;
    if (percentuale <= s.verde) return 'verde';
    if (percentuale <= s.arancione) return 'arancione';
    return 'rosso';
  } else {
    // Errori: più basso è meglio
    const s = soglie.errori;
    if (percentuale <= s.verde) return 'verde';
    if (percentuale <= s.arancione) return 'arancione';
    return 'rosso';
  }
}

/**
 * Restituisce il colore CSS in base allo stato
 */
export function getColoreCSS(stato: StatoColore): string {
  switch (stato) {
    case 'verde':
      return '#d1fae5'; // Verde chiaro
    case 'arancione':
      return '#fed7aa'; // Arancione chiaro
    case 'rosso':
      return '#fecaca'; // Rosso chiaro
    case 'neutro':
    default:
      return 'transparent';
  }
}

/**
 * Restituisce il colore del testo in base allo stato
 */
export function getColoreTesto(stato: StatoColore): string {
  switch (stato) {
    case 'verde':
      return '#065f46'; // Verde scuro
    case 'arancione':
      return '#92400e'; // Arancione scuro
    case 'rosso':
      return '#991b1b'; // Rosso scuro
    case 'neutro':
    default:
      return 'inherit';
  }
}
