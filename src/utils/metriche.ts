/**
 * Funzioni pure per il calcolo delle metriche di ricezione
 * Nessuna dipendenza esterna, nessun side effect
 */

export interface Colpo {
  outcome: string;
  side?: string;
  direction?: string;
  serveZone?: number;
  speedCategory?: string;
  serveTypology?: string;
}

export interface Metriche {
  pp: number;
  er: number;
  pe: number;
  pn: number;
}

/**
 * Calcola la Percentuale Positiva (PP)
 * PP = (Perfette + Positive) / totale × 100
 */
export function calcolaPP(colpi: Colpo[]): number {
  if (colpi.length === 0) return 0;
  const positivi = colpi.filter(c => c.outcome === '#' || c.outcome === '+').length;
  return (positivi / colpi.length) * 100;
}

/**
 * Calcola l'Efficienza di Ricezione (ER)
 * ER = (Perfette + Positive − Errori) / totale × 100
 */
export function calcolaER(colpi: Colpo[]): number {
  if (colpi.length === 0) return 0;
  const perfetti = colpi.filter(c => c.outcome === '#').length;
  const positivi = colpi.filter(c => c.outcome === '+').length;
  const errori = colpi.filter(c => c.outcome === '=').length;
  return ((perfetti + positivi - errori) / colpi.length) * 100;
}

/**
 * Calcola la Percentuale Errori (PE)
 * PE = Errori / totale × 100
 */
export function calcolaPE(colpi: Colpo[]): number {
  if (colpi.length === 0) return 0;
  const errori = colpi.filter(c => c.outcome === '=').length;
  return (errori / colpi.length) * 100;
}

/**
 * Calcola la Percentuale Negativa (PN)
 * PN = (Negative + Slash) / totale × 100
 */
export function calcolaPN(colpi: Colpo[]): number {
  if (colpi.length === 0) return 0;
  const negativi = colpi.filter(c => c.outcome === '-' || c.outcome === '/').length;
  return (negativi / colpi.length) * 100;
}

/**
 * Calcola tutte le metriche in una volta
 */
export function calcolaMetriche(colpi: Colpo[]): Metriche {
  return {
    pp: calcolaPP(colpi),
    er: calcolaER(colpi),
    pe: calcolaPE(colpi),
    pn: calcolaPN(colpi),
  };
}

/**
 * Calcola metriche per una condizione specifica
 */
export function calcolaMetrichePerCondizione(
  colpi: Colpo[],
  chiave: keyof Colpo,
  valore: string | number
): { metriche: Metriche; totale: number } {
  const filtrati = colpi.filter(c => c[chiave] === valore);
  return {
    metriche: calcolaMetriche(filtrati),
    totale: filtrati.length,
  };
}

/**
 * Classifica la PP
 */
export function classificaPP(valore: number): 'ottimo' | 'buono' | 'migliorare' | 'insufficiente' {
  if (valore >= 55) return 'ottimo';
  if (valore >= 45) return 'buono';
  if (valore >= 35) return 'migliorare';
  return 'insufficiente';
}

/**
 * Classifica l'ER
 */
export function classificaER(valore: number): 'ottimo' | 'buono' | 'migliorare' | 'insufficiente' {
  if (valore >= 45) return 'ottimo';
  if (valore >= 40) return 'buono';
  if (valore >= 30) return 'migliorare';
  return 'insufficiente';
}

/**
 * Restituisce l'emoji per la classifica
 */
export function emojiPerClassifica(classifica: string): string {
  switch (classifica) {
    case 'ottimo': return '🌟';
    case 'buono': return '✅';
    case 'migliorare': return '⚠️';
    case 'insufficiente': return '❌';
    default: return '❓';
  }
}

/**
 * Restituisce il colore per la classifica
 */
export function colorePerClassifica(classifica: string): string {
  switch (classifica) {
    case 'ottimo': return '#16a34a';
    case 'buono': return '#ca8a04';
    case 'migliorare': return '#ea580c';
    case 'insufficiente': return '#dc2626';
    default: return '#6b7280';
  }
}
