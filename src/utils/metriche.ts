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
 * FIX DISTINZIONE ESITI: PE conta SOLO '=' (errori diretti/ace subiti)
 * PE = Solo Errori (=) / totale × 100
 */
export function calcolaPE(colpi: Colpo[]): number {
  if (colpi.length === 0) return 0;
  const errori = colpi.filter(c => c.outcome === '=').length; // FIX DISTINZIONE ESITI: SOLO '='
  return (errori / colpi.length) * 100;
}

/**
 * Calcola la Percentuale Negativa (PN)
 * FIX DISTINZIONE ESITI: PN conta SOLO '-' (ricezioni negative ma giocabili)
 * PN = Solo Negative (-) / totale × 100
 */
export function calcolaPN(colpi: Colpo[]): number {
  if (colpi.length === 0) return 0;
  const negative = colpi.filter(c => c.outcome === '-').length; // FIX DISTINZIONE ESITI: SOLO '-'
  return (negative / colpi.length) * 100;
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

/**
 * Valuta lo stato complessivo del giocatore
 * FIX DISTINZIONE ESITI: Nuove soglie basate su PE (solo '=') e PN (solo '-')
 * CRITICITÀ GRAVE (Rosso): PE ≥ 15% OPPURE ER < 30%
 * ATTENZIONE (Giallo): PN ≥ 25% OPPURE PE tra 5% e 14%
 * SICUREZZA (Verde): PP ≥ 60% E PE ≤ 5%
 */
export function valutaStato(pp: number, er: number, pe: number, pn: number): 'sicuro' | 'critico' | 'attenzione' | 'neutro' {
  // FIX DISTINZIONE ESITI: Soglia critica abbassata per PE (solo '=')
  if (pe >= 15 || er < 30) return 'critico';
  // FIX DISTINZIONE ESITI: PN ora conta solo '-'
  if (pn >= 25 || (pe >= 5 && pe < 15)) return 'attenzione';
  if (pp >= 60 && pe <= 5) return 'sicuro';
  return 'neutro';
}

/**
 * FIX SPATIALE: Mappatura zona -> lato del corpo/campo
 * Converte il nome della zona in lato per raccomandazioni precise
 */
export function getLatoDaZona(zona: string): string {
  const zonaLower = zona.toLowerCase();
  if (zonaLower.includes('destra') || zonaLower === 'destro') return 'destro';
  if (zonaLower.includes('sinistra') || zonaLower === 'sinistro') return 'sinistro';
  if (zonaLower.includes('centro') || zonaLower === 'centrale') return 'centrale';
  return 'centrale'; // default
}

/**
 * FIX SPATIALE: Restituisce il lato opposto (per correzione errori)
 */
export function getLatoOpposto(lato: string): string {
  if (lato === 'destro') return 'sinistro';
  if (lato === 'sinistro') return 'destro';
  return 'centrale';
}

/**
 * Calcola la direzione relativa della battuta rispetto al giocatore
 * Prospettiva: dal punto di vista del RICEVITORE che guarda verso la rete
 * 
 * Mappatura corretta:
 * - Giocatore in Zona Sinistra: parallela da Zona 1, diagonale da Zona 5 e 6
 * - Giocatore in Zona Centro: parallela da Zona 6, diagonale da Zona 1 e 5
 * - Giocatore in Zona Destra: parallela da Zona 5, diagonale da Zona 1 e 6
 * 
 * @param zonaGiocatore - Zona dove si trova il giocatore (Sinistra/Centro/Destra)
 * @param zonaBattuta - Zona da cui arriva la battuta (1/5/6)
 * @returns Descrizione della direzione relativa
 */
export function calcolaDirezioneRelativa(zonaGiocatore: string, zonaBattuta: number): string {
  const zonaLower = zonaGiocatore.toLowerCase();
  
  // Giocatore in Zona Sinistra (4, 7, 5)
  if (zonaLower.includes('sinistra')) {
    if (zonaBattuta === 1) return 'parallela'; // Zona 1 è di fronte alla sinistra
    if (zonaBattuta === 5) return 'dalla sua destra (diagonale)'; // Zona 5 arriva in diagonale da destra
    if (zonaBattuta === 6) return 'dalla sua destra (diagonale)'; // Zona 6 arriva in diagonale da destra
  }
  
  // Giocatore in Zona Centro (3, 8, 6)
  if (zonaLower.includes('centro')) {
    if (zonaBattuta === 1) return 'dalla sua sinistra (diagonale)'; // Zona 1 arriva in diagonale da sinistra
    if (zonaBattuta === 5) return 'dalla sua destra (diagonale)'; // Zona 5 arriva in diagonale da destra
    if (zonaBattuta === 6) return 'parallela (frontale)'; // Zona 6 è di fronte al centro
  }
  
  // Giocatore in Zona Destra (2, 9, 1)
  if (zonaLower.includes('destra')) {
    if (zonaBattuta === 1) return 'dalla sua sinistra (diagonale)'; // Zona 1 arriva in diagonale da sinistra
    if (zonaBattuta === 5) return 'parallela'; // Zona 5 è di fronte alla destra
    if (zonaBattuta === 6) return 'dalla sua sinistra (diagonale)'; // Zona 6 arriva in diagonale da sinistra
  }
  
  return 'direzione non specificata';
}
