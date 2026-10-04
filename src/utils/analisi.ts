/**
 * Analisi completa delle 7 dimensioni per ogni giocatore
 */

// FIX DISTINZIONE ESITI: Import delle nuove funzioni per precisione spaziale e logica corretta
import { Colpo, calcolaMetriche, calcolaMetrichePerCondizione, classificaPP, classificaER, valutaStato, getLatoDaZona } from './metriche';

export interface AnalisiCondizione {
  nome: string;
  totale: number;
  pp: number;
  er: number;
  pe: number;
  pn: number;
  classificaPP: string;
  classificaER: string;
}

export interface AnalisiGiocatore {
  giocatoreIndex: number; // FIX MAPPING ID: Ora è l'indice, non l'ID
  giocatoreNome: string;
  datiInsufficienti: boolean;
  totaleColpi: number;
  metricheGlobali: {
    pp: number;
    er: number;
    pe: number;
    pn: number;
    classificaPP: string;
    classificaER: string;
  };
  perEsito: AnalisiCondizione[];
  perZona: AnalisiCondizione[];
  perDirezione: AnalisiCondizione[];
  perProvenienza: AnalisiCondizione[];
  perVelocita: AnalisiCondizione[];
  perTipologia: AnalisiCondizione[];
  puntiDiForza: {
    migliorEsito: string | null;
    migliorZona: string | null;
    migliorDirezione: string | null;
    migliorProvenienza: string | null;
    migliorVelocita: string | null;
    migliorTipologia: string | null;
    combinazioneMigliore: string | null;
    caratteristichePositivita: string;
  };
  puntiDeboli: {
    esitoNegativoPrevalente: string | null;
    zonaCritica: string | null;
    direzioneCritica: string | null;
    provenienzaCritica: string | null;
    velocitaCritica: string | null;
    tipologiaCritica: string | null;
    combinazionePeggiore: string | null;
    caratteristicheNegativita: string;
  };
  sintesi: string;
}

const ESITI = ['Perfetta', 'Positiva', 'Esclamativa', 'Negativa', 'Slash', 'Errore'];
const ZONE = ['Sinistra', 'Centro', 'Destra'];
const DIREZIONI = ['Davanti al corpo', 'A sinistra del corpo', 'Al corpo', 'A destra del corpo', 'Dietro al corpo'];
const PROVENIENZE = ['Zona 1', 'Zona 6', 'Zona 5'];
const VELOCITA = ['Lenta', 'Media', 'Veloce'];
const TIPOLOGIE = ['Flottante', 'Jump Top Spin', 'Jump Flottante'];

/**
 * Genera l'analisi completa per un giocatore
 * FIX MAPPING ID: giocatoreIndex è l'indice dell'array (0, 1, 2...)
 * che corrisponde a playerIndex nei colpi salvati
 */
export function generaAnalisiCompleta(
  giocatoreIndex: number,
  giocatoreNome: string,
  tuttiIColpi: Colpo[]
): AnalisiGiocatore {
  const colpiGiocatore = tuttiIColpi.filter(c => (c as any).playerIndex === giocatoreIndex);
  const totaleColpi = colpiGiocatore.length;

  // Dati insufficienti
  if (totaleColpi < 5) {
    return {
      giocatoreIndex,
      giocatoreNome,
      datiInsufficienti: true,
      totaleColpi,
      metricheGlobali: { pp: 0, er: 0, pe: 0, pn: 0, classificaPP: 'insufficiente', classificaER: 'insufficiente' },
      perEsito: [],
      perZona: [],
      perDirezione: [],
      perProvenienza: [],
      perVelocita: [],
      perTipologia: [],
      puntiDiForza: {
        migliorEsito: null,
        migliorZona: null,
        migliorDirezione: null,
        migliorProvenienza: null,
        migliorVelocita: null,
        migliorTipologia: null,
        combinazioneMigliore: null,
        caratteristichePositivita: '',
      },
      puntiDeboli: {
        esitoNegativoPrevalente: null,
        zonaCritica: null,
        direzioneCritica: null,
        provenienzaCritica: null,
        velocitaCritica: null,
        tipologiaCritica: null,
        combinazionePeggiore: null,
        caratteristicheNegativita: '',
      },
      sintesi: 'Dati insufficienti per un\'analisi significativa (minimo 5 colpi richiesti)',
    };
  }

  // Metriche globali
  const metricheGlobali = calcolaMetriche(colpiGiocatore);

  // Analisi per esito
  const perEsito = ESITI.map(nome => {
    const outcomeKey = nome === 'Perfetta' ? '#' : nome === 'Positiva' ? '+' : nome === 'Esclamativa' ? '!' : nome === 'Negativa' ? '-' : nome === 'Slash' ? '/' : '=';
    const colpi = colpiGiocatore.filter(c => c.outcome === outcomeKey);
    const m = calcolaMetriche(colpi);
    return {
      nome,
      totale: colpi.length,
      ...m,
      classificaPP: classificaPP(m.pp),
      classificaER: classificaER(m.er),
    };
  });

  // Analisi per zona
  const perZona = ZONE.map(nome => {
    const colpi = colpiGiocatore.filter(c => c.side === nome);
    const m = calcolaMetriche(colpi);
    return {
      nome,
      totale: colpi.length,
      ...m,
      classificaPP: classificaPP(m.pp),
      classificaER: classificaER(m.er),
    };
  });

  // Analisi per direzione
  const perDirezione = DIREZIONI.map(nome => {
    const colpi = colpiGiocatore.filter(c => c.direction === nome);
    const m = calcolaMetriche(colpi);
    return {
      nome,
      totale: colpi.length,
      ...m,
      classificaPP: classificaPP(m.pp),
      classificaER: classificaER(m.er),
    };
  });

  // Analisi per provenienza
  const perProvenienza = PROVENIENZE.map(nome => {
    const zonaNum = nome === 'Zona 1' ? 1 : nome === 'Zona 6' ? 6 : 5;
    const colpi = colpiGiocatore.filter(c => c.serveZone === zonaNum);
    const m = calcolaMetriche(colpi);
    return {
      nome,
      totale: colpi.length,
      ...m,
      classificaPP: classificaPP(m.pp),
      classificaER: classificaER(m.er),
    };
  });

  // Analisi per velocità
  const perVelocita = VELOCITA.map(nome => {
    const colpi = colpiGiocatore.filter(c => c.speedCategory === nome);
    const m = calcolaMetriche(colpi);
    return {
      nome,
      totale: colpi.length,
      ...m,
      classificaPP: classificaPP(m.pp),
      classificaER: classificaER(m.er),
    };
  });

  // Analisi per tipologia
  const perTipologia = TIPOLOGIE.map(nome => {
    const colpi = colpiGiocatore.filter(c => c.serveTypology === nome);
    const m = calcolaMetriche(colpi);
    return {
      nome,
      totale: colpi.length,
      ...m,
      classificaPP: classificaPP(m.pp),
      classificaER: classificaER(m.er),
    };
  });

  // FIX LOGICA MUTUA ESCLUSIONE: Calcola PRIMA i punti deboli, POI i punti di forza
  // escludendo le zone/direzioni/provenienze già identificate come critiche
  
  // Punti deboli - dove ci sono molti esiti NEGATIVI (=, -)
  const puntiDeboli = {
    esitoNegativoPrevalente: trovaEsitoNegativoPrevalente(colpiGiocatore),
    zonaCritica: trovaCondizioneConPiuNegativi(colpiGiocatore, 'side'),
    direzioneCritica: trovaCondizioneConPiuNegativi(colpiGiocatore, 'direction'),
    provenienzaCritica: trovaCondizioneConPiuNegativi(colpiGiocatore, 'serveZone'),
    velocitaCritica: trovaCondizioneConPiuNegativi(colpiGiocatore, 'speedCategory'),
    tipologiaCritica: trovaCondizioneConPiuNegativi(colpiGiocatore, 'serveTypology'),
    combinazionePeggiore: trovaCombinazioneConPiuNegativi(colpiGiocatore),
    caratteristicheNegativita: analizzaCaratteristicheNegativita(colpiGiocatore),
  };

  // FIX LOGICA MUTUA ESCLUSIONE: Escludi le zone critiche dai punti di forza
  const zoneDaEscludere = puntiDeboli.zonaCritica ? [puntiDeboli.zonaCritica] : [];
  const direzioniDaEscludere = puntiDeboli.direzioneCritica ? [puntiDeboli.direzioneCritica] : [];
  const provenienzeDaEscludere = puntiDeboli.provenienzaCritica ? [puntiDeboli.provenienzaCritica] : [];

  // Punti di forza - dove ci sono molti esiti POSITIVI (#, +)
  // FIX: Esclude le zone/direzioni/provenienze già identificate come critiche
  const puntiDiForza = {
    migliorEsito: trovaMigliore(perEsito)?.nome || null,
    migliorZona: trovaCondizioneConPiuPositivi(colpiGiocatore, 'side', zoneDaEscludere),
    migliorDirezione: trovaCondizioneConPiuPositivi(colpiGiocatore, 'direction', direzioniDaEscludere),
    migliorProvenienza: trovaCondizioneConPiuPositivi(colpiGiocatore, 'serveZone', provenienzeDaEscludere),
    migliorVelocita: trovaCondizioneConPiuPositivi(colpiGiocatore, 'speedCategory'),
    migliorTipologia: trovaCondizioneConPiuPositivi(colpiGiocatore, 'serveTypology'),
    combinazioneMigliore: trovaCombinazioneConPiuPositivi(colpiGiocatore),
    caratteristichePositivita: analizzaCaratteristichePositivita(colpiGiocatore),
  };

  // Sintesi
  const sintesi = generaSintesi(giocatoreNome, metricheGlobali, puntiDiForza, puntiDeboli);

  return {
    giocatoreIndex,
    giocatoreNome,
    datiInsufficienti: false,
    totaleColpi,
    metricheGlobali: {
      ...metricheGlobali,
      classificaPP: classificaPP(metricheGlobali.pp),
      classificaER: classificaER(metricheGlobali.er),
    },
    perEsito,
    perZona,
    perDirezione,
    perProvenienza,
    perVelocita,
    perTipologia,
    puntiDiForza,
    puntiDeboli,
    sintesi,
  };
}

function trovaMigliore(condizioni: AnalisiCondizione[]): AnalisiCondizione | null {
  const valide = condizioni.filter(c => c.totale >= 3);
  if (valide.length === 0) return null;
  return valide.reduce((max, c) => c.pp > max.pp ? c : max, valide[0]);
}

function trovaPeggiore(condizioni: AnalisiCondizione[]): AnalisiCondizione | null {
  const valide = condizioni.filter(c => c.totale >= 3);
  if (valide.length === 0) return null;
  return valide.reduce((min, c) => c.pp < min.pp ? c : min, valide[0]);
}

/**
 * Trova la condizione con più esiti POSITIVI (#, +)
 * FIX: Restituisce null se non ci sono colpi positivi
 * FIX MUTUA ESCLUSIONE: Accetta un parametro opzionale 'escludi' per escludere zone già critiche
 */
function trovaCondizioneConPiuPositivi(colpi: Colpo[], chiave: keyof Colpo, escludi: string[] = []): string | null {
  const valori = [...new Set(colpi.map(c => c[chiave]).filter(v => v !== undefined && v !== 'non-specificata'))];
  
  let maxPositivi = 0;
  let condizioneMigliore: string | null = null;
  
  valori.forEach(valore => {
    // FIX MUTUA ESCLUSIONE: Salta se il valore è nella lista da escludere
    if (escludi.includes(String(valore))) return;
    
    const colpiCondizione = colpi.filter(c => c[chiave] === valore);
    if (colpiCondizione.length < 3) return;
    
    const positivi = colpiCondizione.filter(c => c.outcome === '#' || c.outcome === '+').length;
    // FIX: Aggiorna solo se ci sono effettivamente colpi positivi
    if (positivi > maxPositivi && positivi > 0) {
      maxPositivi = positivi;
      condizioneMigliore = String(valore);
    }
  });
  
  return condizioneMigliore;
}

/**
 * FIX DISTINZIONE ESITI: Trova la condizione con più ERRORI (=) e NEGATIVE (-)
 * Ordina per numero totale di colpi negativi (errori + negative) decrescente
 */
function trovaCondizioneConPiuNegativi(colpi: Colpo[], chiave: keyof Colpo): string | null {
  const valori = [...new Set(colpi.map(c => c[chiave]).filter(v => v !== undefined && v !== 'non-specificata'))];
  
  interface CondizioneNegativa {
    nome: string;
    pe: number; // FIX DISTINZIONE ESITI: PE conta SOLO '='
    pn: number; // FIX DISTINZIONE ESITI: PN conta SOLO '-'
    totaleNegativi: number; // Totale colpi negativi (errori + negative)
    totale: number;
  }
  
  const condizioniNegative: CondizioneNegativa[] = [];
  
  valori.forEach(valore => {
    const colpiCondizione = colpi.filter(c => c[chiave] === valore);
    if (colpiCondizione.length < 3) return;
    
    // FIX DISTINZIONE ESITI: Calcola PE e PN separatamente
    const errori = colpiCondizione.filter(c => c.outcome === '=').length; // SOLO '='
    const negative = colpiCondizione.filter(c => c.outcome === '-').length; // SOLO '-'
    const totale = colpiCondizione.length;
    const totaleNegativi = errori + negative;
    
    // FIX: Ignora se non ci sono colpi negativi
    if (totaleNegativi === 0) return;
    
    const pe = (errori / totale) * 100;
    const pn = (negative / totale) * 100;
    
    condizioniNegative.push({
      nome: String(valore),
      pe,
      pn,
      totaleNegativi,
      totale,
    });
  });
  
  if (condizioniNegative.length === 0) return null;
  
  // FIX: Ordina per numero totale di colpi negativi decrescente
  // Poi per PN decrescente (negative), poi per PE decrescente (errori)
  condizioniNegative.sort((a, b) => {
    if (b.totaleNegativi !== a.totaleNegativi) return b.totaleNegativi - a.totaleNegativi;
    if (b.pn !== a.pn) return b.pn - a.pn;
    return b.pe - a.pe;
  });
  
  return condizioniNegative[0].nome;
}

/**
 * Trova la combinazione con più esiti POSITIVI
 */
function trovaCombinazioneConPiuPositivi(colpi: Colpo[]): string | null {
  const combinazioni: { nome: string; positivi: number }[] = [];
  
  const velocita = ['Lenta', 'Media', 'Veloce'];
  const provenienze = ['Zona 1', 'Zona 6', 'Zona 5'];
  const zone = ['Sinistra', 'Centro', 'Destra'];
  
  for (const vel of velocita) {
    for (const prov of provenienze) {
      for (const zona of zone) {
        const zonaNum = prov === 'Zona 1' ? 1 : prov === 'Zona 6' ? 6 : 5;
        const filtrati = colpi.filter(c => 
          c.speedCategory === vel && 
          c.serveZone === zonaNum && 
          c.side === zona
        );
        if (filtrati.length >= 3) {
          const positivi = filtrati.filter(c => c.outcome === '#' || c.outcome === '+').length;
          combinazioni.push({
            nome: `${vel} + ${prov} + ${zona}`,
            positivi,
          });
        }
      }
    }
  }
  
  if (combinazioni.length === 0) return null;
  return combinazioni.reduce((max, c) => c.positivi > max.positivi ? c : max, combinazioni[0]).nome;
}

/**
 * Trova la combinazione con più esiti NEGATIVI
 */
function trovaCombinazioneConPiuNegativi(colpi: Colpo[]): string | null {
  const combinazioni: { nome: string; negativi: number }[] = [];
  
  const velocita = ['Lenta', 'Media', 'Veloce'];
  const provenienze = ['Zona 1', 'Zona 6', 'Zona 5'];
  const zone = ['Sinistra', 'Centro', 'Destra'];
  
  for (const vel of velocita) {
    for (const prov of provenienze) {
      for (const zona of zone) {
        const zonaNum = prov === 'Zona 1' ? 1 : prov === 'Zona 6' ? 6 : 5;
        const filtrati = colpi.filter(c => 
          c.speedCategory === vel && 
          c.serveZone === zonaNum && 
          c.side === zona
        );
        if (filtrati.length >= 3) {
          const negativi = filtrati.filter(c => c.outcome === '=' || c.outcome === '/' || c.outcome === '-').length;
          combinazioni.push({
            nome: `${vel} + ${prov} + ${zona}`,
            negativi,
          });
        }
      }
    }
  }
  
  if (combinazioni.length === 0) return null;
  return combinazioni.reduce((min, c) => c.negativi > min.negativi ? c : min, combinazioni[0]).nome;
}

/**
 * Analizza le caratteristiche delle positività
 */
function analizzaCaratteristichePositivita(colpi: Colpo[]): string {
  const positivi = colpi.filter(c => c.outcome === '#' || c.outcome === '+');
  if (positivi.length === 0) return '';
  
  const caratteristiche: string[] = [];
  
  // Velocità più frequente nei positivi
  const velocitaCount: Record<string, number> = {};
  positivi.forEach(c => {
    if (c.speedCategory && c.speedCategory !== 'non-specificata') {
      velocitaCount[c.speedCategory] = (velocitaCount[c.speedCategory] || 0) + 1;
    }
  });
  const velocitaPiuFrequente = Object.entries(velocitaCount).sort((a, b) => b[1] - a[1])[0];
  if (velocitaPiuFrequente) {
    caratteristiche.push(`battute ${velocitaPiuFrequente[0].toLowerCase()}`);
  }
  
  // Provenienza più frequente nei positivi
  const provCount: Record<number, number> = {};
  positivi.forEach(c => {
    if (c.serveZone) {
      provCount[c.serveZone] = (provCount[c.serveZone] || 0) + 1;
    }
  });
  const provPiuFrequente = Object.entries(provCount).sort((a, b) => b[1] - a[1])[0];
  if (provPiuFrequente) {
    caratteristiche.push(`dalla zona ${provPiuFrequente[0]}`);
  }
  
  // Zona di campo più frequente nei positivi
  const zonaCount: Record<string, number> = {};
  positivi.forEach(c => {
    if (c.side) {
      zonaCount[c.side] = (zonaCount[c.side] || 0) + 1;
    }
  });
  const zonaPiuFrequente = Object.entries(zonaCount).sort((a, b) => b[1] - a[1])[0];
  if (zonaPiuFrequente) {
    caratteristiche.push(`verso il ${zonaPiuFrequente[0].toLowerCase()}`);
  }
  
  return caratteristiche.join(' ');
}

/**
 * FIX DISTINZIONE ESITI: Analizza le caratteristiche delle NEGATIVE (-)
 * Conta SOLO '-' (ricezioni negative ma giocabili), NON include '=' o '/'
 */
function analizzaCaratteristicheNegativita(colpi: Colpo[]): string {
  // FIX DISTINZIONE ESITI: Conta SOLO '-' (negative)
  const negative = colpi.filter(c => c.outcome === '-'); // SOLO '-'
  if (negative.length === 0) return '';
  
  const caratteristiche: string[] = [];
  
  // Velocità più frequente nelle negative
  const velocitaCount: Record<string, number> = {};
  negative.forEach(c => {
    if (c.speedCategory && c.speedCategory !== 'non-specificata') {
      velocitaCount[c.speedCategory] = (velocitaCount[c.speedCategory] || 0) + 1;
    }
  });
  const velocitaPiuFrequente = Object.entries(velocitaCount).sort((a, b) => b[1] - a[1])[0];
  if (velocitaPiuFrequente) {
    caratteristiche.push(`battute ${velocitaPiuFrequente[0].toLowerCase()}`);
  }
  
  // Provenienza più frequente nelle negative
  const provCount: Record<number, number> = {};
  negative.forEach(c => {
    if (c.serveZone) {
      provCount[c.serveZone] = (provCount[c.serveZone] || 0) + 1;
    }
  });
  const provPiuFrequente = Object.entries(provCount).sort((a, b) => b[1] - a[1])[0];
  if (provPiuFrequente) {
    caratteristiche.push(`dalla zona ${provPiuFrequente[0]}`);
  }
  
  // Zona di campo più frequente nelle negative
  const zonaCount: Record<string, number> = {};
  negative.forEach(c => {
    if (c.side) {
      zonaCount[c.side] = (zonaCount[c.side] || 0) + 1;
    }
  });
  const zonaPiuFrequente = Object.entries(zonaCount).sort((a, b) => b[1] - a[1])[0];
  if (zonaPiuFrequente) {
    caratteristiche.push(`verso il ${zonaPiuFrequente[0].toLowerCase()}`);
  }
  
  return caratteristiche.join(' ');
}

/**
 * FIX DISTINZIONE ESITI: Trova l'esito negativo prevalente
 * Distingue tra Errori (=), Slash (/), e Negative (-)
 */
function trovaEsitoNegativoPrevalente(colpi: Colpo[]): string | null {
  const errori = colpi.filter(c => c.outcome === '=').length; // SOLO '='
  const slash = colpi.filter(c => c.outcome === '/').length; // SOLO '/'
  const negative = colpi.filter(c => c.outcome === '-').length; // SOLO '-'
  
  if (errori === 0 && slash === 0 && negative === 0) return null;
  
  // FIX DISTINZIONE ESITI: Restituisce l'esito più frequente
  if (errori >= slash && errori >= negative) return 'Errore (=)';
  if (slash >= errori && slash >= negative) return 'Slash (/)';
  return 'Negativa (-)';
}

function trovaCombinazioneMigliore(colpi: Colpo[]): string | null {
  const combinazioni: { nome: string; pp: number }[] = [];
  
  const velocita = ['Lenta', 'Media', 'Veloce'];
  const provenienze = ['Zona 1', 'Zona 6', 'Zona 5'];
  const zone = ['Sinistra', 'Centro', 'Destra'];
  
  for (const vel of velocita) {
    for (const prov of provenienze) {
      for (const zona of zone) {
        const zonaNum = prov === 'Zona 1' ? 1 : prov === 'Zona 6' ? 6 : 5;
        const filtrati = colpi.filter(c => 
          c.speedCategory === vel && 
          c.serveZone === zonaNum && 
          c.side === zona
        );
        if (filtrati.length >= 3) {
          const pp = calcolaMetriche(filtrati).pp;
          combinazioni.push({
            nome: `${vel} + ${prov} + ${zona}`,
            pp,
          });
        }
      }
    }
  }
  
  if (combinazioni.length === 0) return null;
  return combinazioni.reduce((max, c) => c.pp > max.pp ? c : max, combinazioni[0]).nome;
}

function trovaCombinazionePeggiore(colpi: Colpo[]): string | null {
  const combinazioni: { nome: string; pp: number }[] = [];
  
  const velocita = ['Lenta', 'Media', 'Veloce'];
  const provenienze = ['Zona 1', 'Zona 6', 'Zona 5'];
  const zone = ['Sinistra', 'Centro', 'Destra'];
  
  for (const vel of velocita) {
    for (const prov of provenienze) {
      for (const zona of zone) {
        const zonaNum = prov === 'Zona 1' ? 1 : prov === 'Zona 6' ? 6 : 5;
        const filtrati = colpi.filter(c => 
          c.speedCategory === vel && 
          c.serveZone === zonaNum && 
          c.side === zona
        );
        if (filtrati.length >= 3) {
          const pp = calcolaMetriche(filtrati).pp;
          combinazioni.push({
            nome: `${vel} + ${prov} + ${zona}`,
            pp,
          });
        }
      }
    }
  }
  
  if (combinazioni.length === 0) return null;
  return combinazioni.reduce((min, c) => c.pp < min.pp ? c : min, combinazioni[0]).nome;
}

function generaSintesi(
  nome: string,
  metriche: { pp: number; er: number; pe: number; pn: number },
  puntiDiForza: any,
  puntiDeboli: any
): string {
  const classER = classificaER(metriche.er);
  const giudizioER = classER === 'ottimo' ? 'Ottima' : classER === 'buono' ? 'Buona' : classER === 'migliorare' ? 'Da migliorare' : 'Insufficiente';
  
  // FIX DISTINZIONE ESITI: Valuta lo stato con le nuove soglie
  const stato = valutaStato(metriche.pp, metriche.er, metriche.pe, metriche.pn);
  
  let sintesi = `${nome} ha un'efficienza del ${metriche.er.toFixed(0)}% (${giudizioER}). La percentuale positiva è del ${metriche.pp.toFixed(0)}%. `;
  
  // FIX DISTINZIONE ESITI: Mostra separatamente errori e negative
  if (metriche.pe > 0) {
    sintesi += `Errori diretti (Ace subiti): ${metriche.pe.toFixed(1)}%. `;
  }
  if (metriche.pn > 0) {
    sintesi += `Ricezioni negative (giocabili ma difficili): ${metriche.pn.toFixed(1)}%. `;
  }
  
  // Punti di forza basati sulle EVIDENZE POSITIVE
  if (puntiDiForza.caratteristichePositivita) {
    sintesi += `Eccelle su ${puntiDiForza.caratteristichePositivita}, dove produce molti esiti positivi. `;
  } else if (puntiDiForza.combinazioneMigliore) {
    sintesi += `Eccelle su ${puntiDiForza.combinazioneMigliore}. `;
  }
  
  // FIX SPATIALE: Punti deboli basati sulle EVIDENZE NEGATIVE con precisione spaziale
  if (puntiDeboli.zonaCritica) {
    const latoCorretto = getLatoDaZona(puntiDeboli.zonaCritica); // FIX SPATIALE
    sintesi += `Criticità in Zona ${puntiDeboli.zonaCritica}. `;
  } else if (puntiDeboli.combinazionePeggiore) {
    sintesi += `Difficoltà su ${puntiDeboli.combinazionePeggiore}. `;
  }
  
  // FIX SPATIALE: Raccomandazione con precisione spaziale assoluta
  if (puntiDeboli.zonaCritica || puntiDeboli.velocitaCritica || puntiDeboli.provenienzaCritica) {
    sintesi += `RACCOMANDAZIONE: `;
    
    // FIX SPATIALE: Se c'è una zona critica, usa getLatoDaZona per il lato corretto
    if (puntiDeboli.zonaCritica) {
      const latoCorretto = getLatoDaZona(puntiDeboli.zonaCritica);
      sintesi += `L'atleta deve lavorare specificamente sul lato ${latoCorretto} del corpo`;
      
      // Aggiungi dettagli su errori vs negative
      if (metriche.pe >= 15) {
        sintesi += ` per ridurre gli errori diretti (Ace subiti)`;
      } else if (metriche.pn >= 25) {
        sintesi += ` per migliorare la stabilità su ricezioni difficili`;
      }
      
      sintesi += `. `;
    }
    
    // Aggiungi dettagli su velocità e provenienza
    const dettagli = [];
    if (puntiDeboli.velocitaCritica) dettagli.push(`battute ${puntiDeboli.velocitaCritica.toLowerCase()}`);
    if (puntiDeboli.provenienzaCritica) dettagli.push(`dalla ${puntiDeboli.provenienzaCritica}`);
    
    if (dettagli.length > 0) {
      sintesi += `Focus su ${dettagli.join(' e ')}.`;
    }
  } else {
    sintesi += `Continuare con gli allenamenti standard.`;
  }
  
  return sintesi;
}
