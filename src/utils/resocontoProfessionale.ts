/**
 * Generatore di resoconto professionale con numeri concreti
 * NUOVO FILE - Analisi dettagliata per allenatori
 */

import { SoglieConfig } from './configSoglie';
import { getStatoColore } from './valutaColori';
import { getLatoDaZona } from './metriche';

// Interfacce per i dati di input
export interface ColpoRicezioneAvanzato {
  playerIndex: number;
  playerName: string;
  zone: number;
  side: string; // 'Sinistra' | 'Centro' | 'Destra'
  serveType: string;
  serveZone: number;
  fundamental: string; // 'B' | 'P'
  direction: string;
  outcome: string; // '#' | '+' | '!' | '-' | '/' | '='
  speed: number | null;
  timestamp: string;
}

// Interfacce per il resoconto
export interface RiepilogoNumerico {
  totalePalloni: number;
  perTipologia: Record<string, { totale: number; percentuale: number }>;
  perTecnica: Record<string, { totale: number; percentuale: number }>;
  perTipologiaETecnica: Record<string, { totale: number; pp: number; er: number; pe: number }>;
}

export interface AnalisiZonaNumerica {
  zona: string;
  totale: number;
  esiti: {
    perfetta: { count: number; percent: number };
    positiva: { count: number; percent: number };
    esclamativa: { count: number; percent: number };
    negativa: { count: number; percent: number };
    slash: { count: number; percent: number };
    errore: { count: number; percent: number };
  };
  pp: number;
  er: number;
  pe: number;
  pn: number;
}

export interface AnalisiTecnica {
  tecnica: string;
  totale: number;
  pp: number;
  er: number;
  pe: number;
}

export interface PuntoDiForza {
  descrizione: string;
  numeri: string;
  dettaglio: string;
}

export interface Criticita {
  descrizione: string;
  numeri: string;
  dettaglio: string;
  raccomandazione: string;
  priorita: 'alta' | 'media' | 'bassa';
}

export interface ResocontoProfessionale {
  giocatoreNome: string;
  riepilogo: RiepilogoNumerico;
  analisiZone: AnalisiZonaNumerica[];
  analisiTecnica: AnalisiTecnica[];
  puntiDiForza: PuntoDiForza[];
  criticita: Criticita[];
  sintesiFinale: string;
}

// Funzioni helper
function calcolaPercentuale(numeratore: number, denominatore: number): number {
  if (denominatore === 0) return 0;
  return (numeratore / denominatore) * 100;
}

function calcolaPP(colpi: ColpoRicezioneAvanzato[]): number {
  if (colpi.length === 0) return 0;
  const positivi = colpi.filter(c => c.outcome === '#' || c.outcome === '+').length;
  return calcolaPercentuale(positivi, colpi.length);
}

function calcolaER(colpi: ColpoRicezioneAvanzato[]): number {
  if (colpi.length === 0) return 0;
  const perfetti = colpi.filter(c => c.outcome === '#').length;
  const positivi = colpi.filter(c => c.outcome === '+').length;
  const errori = colpi.filter(c => c.outcome === '=').length;
  return calcolaPercentuale(perfetti + positivi - errori, colpi.length);
}

function calcolaPE(colpi: ColpoRicezioneAvanzato[]): number {
  if (colpi.length === 0) return 0;
  const errori = colpi.filter(c => c.outcome === '=').length;
  return calcolaPercentuale(errori, colpi.length);
}

function calcolaPN(colpi: ColpoRicezioneAvanzato[]): number {
  if (colpi.length === 0) return 0;
  const negative = colpi.filter(c => c.outcome === '-').length;
  return calcolaPercentuale(negative, colpi.length);
}

// Funzione principale
export function generaResocontoProfessionaleCompleto(
  giocatoreNome: string,
  colpi: ColpoRicezioneAvanzato[],
  soglie: SoglieConfig
): ResocontoProfessionale {
  // Filtra colpi per il giocatore
  const colpiGiocatore = colpi.filter(c => c.playerName === giocatoreNome);
  const totalePalloni = colpiGiocatore.length;

  if (totalePalloni === 0) {
    return {
      giocatoreNome,
      riepilogo: {
        totalePalloni: 0,
        perTipologia: {},
        perTecnica: {},
        perTipologiaETecnica: {}
      },
      analisiZone: [],
      analisiTecnica: [],
      puntiDiForza: [],
      criticita: [],
      sintesiFinale: 'Nessun dato disponibile per questo giocatore.'
    };
  }

  // 1. Riepilogo Numerico
  const perTipologia: Record<string, { totale: number; percentuale: number }> = {};
  const tipologie = ['Flottante', 'Jump Top Spin', 'Jump Flottante'];
  tipologie.forEach(tip => {
    const colpiTip = colpiGiocatore.filter(c => c.serveType === tip);
    perTipologia[tip] = {
      totale: colpiTip.length,
      percentuale: calcolaPercentuale(colpiTip.length, totalePalloni)
    };
  });

  const perTecnica: Record<string, { totale: number; percentuale: number }> = {
    'Bagher': {
      totale: colpiGiocatore.filter(c => c.fundamental === 'B').length,
      percentuale: calcolaPercentuale(colpiGiocatore.filter(c => c.fundamental === 'B').length, totalePalloni)
    },
    'Palleggio': {
      totale: colpiGiocatore.filter(c => c.fundamental === 'P').length,
      percentuale: calcolaPercentuale(colpiGiocatore.filter(c => c.fundamental === 'P').length, totalePalloni)
    }
  };

  const perTipologiaETecnica: Record<string, { totale: number; pp: number; er: number; pe: number }> = {};
  tipologie.forEach(tip => {
    ['Bagher', 'Palleggio'].forEach(tec => {
      const key = `${tip} in ${tec.toLowerCase()}`;
      const colpiCombo = colpiGiocatore.filter(c => 
        c.serveType === tip && 
        ((tec === 'Bagher' && c.fundamental === 'B') || (tec === 'Palleggio' && c.fundamental === 'P'))
      );
      if (colpiCombo.length > 0) {
        perTipologiaETecnica[key] = {
          totale: colpiCombo.length,
          pp: calcolaPP(colpiCombo),
          er: calcolaER(colpiCombo),
          pe: calcolaPE(colpiCombo)
        };
      }
    });
  });

  // 2. Analisi per Zona
  const zone = ['Sinistra', 'Centro', 'Destra'];
  const analisiZone: AnalisiZonaNumerica[] = zone.map(zona => {
    const colpiZona = colpiGiocatore.filter(c => c.side === zona);
    const totale = colpiZona.length;
    
    return {
      zona,
      totale,
      esiti: {
        perfetta: {
          count: colpiZona.filter(c => c.outcome === '#').length,
          percent: calcolaPercentuale(colpiZona.filter(c => c.outcome === '#').length, totale)
        },
        positiva: {
          count: colpiZona.filter(c => c.outcome === '+').length,
          percent: calcolaPercentuale(colpiZona.filter(c => c.outcome === '+').length, totale)
        },
        esclamativa: {
          count: colpiZona.filter(c => c.outcome === '!').length,
          percent: calcolaPercentuale(colpiZona.filter(c => c.outcome === '!').length, totale)
        },
        negativa: {
          count: colpiZona.filter(c => c.outcome === '-').length,
          percent: calcolaPercentuale(colpiZona.filter(c => c.outcome === '-').length, totale)
        },
        slash: {
          count: colpiZona.filter(c => c.outcome === '/').length,
          percent: calcolaPercentuale(colpiZona.filter(c => c.outcome === '/').length, totale)
        },
        errore: {
          count: colpiZona.filter(c => c.outcome === '=').length,
          percent: calcolaPercentuale(colpiZona.filter(c => c.outcome === '=').length, totale)
        }
      },
      pp: calcolaPP(colpiZona),
      er: calcolaER(colpiZona),
      pe: calcolaPE(colpiZona),
      pn: calcolaPN(colpiZona)
    };
  });

  // 3. Analisi Tecnica
  const analisiTecnica: AnalisiTecnica[] = [
    {
      tecnica: 'Bagher',
      totale: perTecnica['Bagher'].totale,
      pp: calcolaPP(colpiGiocatore.filter(c => c.fundamental === 'B')),
      er: calcolaER(colpiGiocatore.filter(c => c.fundamental === 'B')),
      pe: calcolaPE(colpiGiocatore.filter(c => c.fundamental === 'B'))
    },
    {
      tecnica: 'Palleggio',
      totale: perTecnica['Palleggio'].totale,
      pp: calcolaPP(colpiGiocatore.filter(c => c.fundamental === 'P')),
      er: calcolaER(colpiGiocatore.filter(c => c.fundamental === 'P')),
      pe: calcolaPE(colpiGiocatore.filter(c => c.fundamental === 'P'))
    }
  ];

  // 4. Identifica Punti di Forza
  const puntiDiForza: PuntoDiForza[] = [];
  
  // Cerca combinazioni con PP alta
  Object.entries(perTipologiaETecnica).forEach(([key, data]) => {
    const statoPP = getStatoColore('positivo', data.pp, soglie);
    if (statoPP === 'verde' && data.totale >= 3) {
      puntiDiForza.push({
        descrizione: key,
        numeri: `${data.totale} palloni, PP ${data.pp.toFixed(0)}%, ER ${data.er.toFixed(0)}%`,
        dettaglio: `Il ${data.pp.toFixed(0)}% delle ricezioni sono positive o perfette`
      });
    }
  });

  // Cerca zone con PP alta
  analisiZone.forEach(zona => {
    const statoPP = getStatoColore('positivo', zona.pp, soglie);
    if (statoPP === 'verde' && zona.totale >= 3) {
      puntiDiForza.push({
        descrizione: `Zona ${zona.zona}`,
        numeri: `${zona.totale} palloni, PP ${zona.pp.toFixed(0)}%, ER ${zona.er.toFixed(0)}%`,
        dettaglio: `Il ${zona.esiti.perfetta.percent + zona.esiti.positiva.percent}0% delle ricezioni in ${zona.zona} sono positive o perfette`
      });
    }
  });

  // 5. Identifica Criticità
  const criticita: Criticita[] = [];
  
  // Cerca zone con PE alta o ER bassa
  analisiZone.forEach(zona => {
    const statoPE = getStatoColore('errore', zona.pe, soglie);
    const statoER = getStatoColore('positivo', zona.er, soglie);
    
    if ((statoPE === 'rosso' || statoER === 'rosso') && zona.totale >= 3) {
      const latoCorretto = getLatoDaZona(zona.zona);
      criticita.push({
        descrizione: `Zona ${zona.zona}`,
        numeri: `${zona.totale} palloni, PP ${zona.pp.toFixed(0)}%, ER ${zona.er.toFixed(0)}%, PE ${zona.pe.toFixed(0)}%`,
        dettaglio: `${zona.esiti.errore.count} errori diretti (Ace) su ${zona.totale} ricezioni, ${zona.esiti.negativa.count} negative su ${zona.totale} (${zona.esiti.negativa.percent.toFixed(0)}%)`,
        raccomandazione: `L'atleta deve lavorare sul LATO ${latoCorretto.toUpperCase()} del corpo. Esercizio: 20 min di bagher laterale ${latoCorretto} con jump top spin dalla zona 1.`,
        priorita: statoPE === 'rosso' ? 'alta' : 'media'
      });
    }
  });

  // Cerca tecniche con PE alta
  analisiTecnica.forEach(tecnica => {
    const statoPE = getStatoColore('errore', tecnica.pe, soglie);
    if (statoPE === 'rosso' && tecnica.totale >= 3) {
      criticita.push({
        descrizione: `Ricezione in ${tecnica.tecnica.toLowerCase()}`,
        numeri: `${tecnica.totale} palloni, PP ${tecnica.pp.toFixed(0)}%, PE ${tecnica.pe.toFixed(0)}%`,
        dettaglio: `${(tecnica.pe * tecnica.totale / 100).toFixed(0)} errori su ${tecnica.totale} tentativi`,
        raccomandazione: tecnica.tecnica === 'Palleggio' 
          ? 'Evitare il tocco in ricezione. Drill: bagher con vincolo mani dietro la schiena.'
          : 'Migliorare la tecnica di bagher. Drill: 30 min di bagher frontale con focus sulla piattaforma.',
        priorita: 'alta'
      });
    }
  });

  // 6. Sintesi Finale
  const sintesiFinale = generaSintesiFinale(
    giocatoreNome,
    totalePalloni,
    perTipologia,
    perTecnica,
    puntiDiForza,
    criticita
  );

  return {
    giocatoreNome,
    riepilogo: {
      totalePalloni,
      perTipologia,
      perTecnica,
      perTipologiaETecnica
    },
    analisiZone,
    analisiTecnica,
    puntiDiForza,
    criticita,
    sintesiFinale
  };
}

function generaSintesiFinale(
  nome: string,
  totale: number,
  perTipologia: Record<string, { totale: number; percentuale: number }>,
  perTecnica: Record<string, { totale: number; percentuale: number }>,
  puntiDiForza: PuntoDiForza[],
  criticita: Criticita[]
): string {
  let sintesi = `"${nome} ha ricevuto ${totale} palloni: `;
  
  // Aggiungi tipologie
  const tipParts: string[] = [];
  Object.entries(perTipologia).forEach(([tip, data]) => {
    if (data.totale > 0) {
      tipParts.push(`${data.totale} ${tip.toLowerCase()}`);
    }
  });
  sintesi += tipParts.join(', ') + '. ';
  
  // Aggiungi tecniche
  const tecParts: string[] = [];
  Object.entries(perTecnica).forEach(([tec, data]) => {
    if (data.totale > 0) {
      tecParts.push(`${tec.toLowerCase()} nel ${data.percentuale.toFixed(0)}% dei casi (${data.totale} palloni)`);
    }
  });
  sintesi += 'Ha usato ' + tecParts.join(' e ') + '. ';
  
  // Punti di forza
  if (puntiDiForza.length > 0) {
    sintesi += `PUNTI DI FORZA: ${puntiDiForza[0].descrizione} (${puntiDiForza[0].numeri}). `;
  }
  
  // Criticità
  if (criticita.length > 0) {
    sintesi += 'CRITICITÀ: ';
    const critParts: string[] = [];
    criticita.forEach(c => {
      critParts.push(`${c.descrizione} (${c.numeri.split(',')[0]})`);
    });
    sintesi += critParts.join(', ') + '. ';
    
    // Raccomandazioni
    sintesi += 'RACCOMANDAZIONI: ';
    criticita.forEach((c, idx) => {
      sintesi += `${idx + 1}. ${c.raccomandazione} `;
    });
  }
  
  sintesi += '"';
  
  return sintesi;
}
