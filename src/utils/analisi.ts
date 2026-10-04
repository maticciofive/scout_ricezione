/**
 * Analisi completa delle 7 dimensioni per ogni giocatore
 */

import { Colpo, calcolaMetriche, calcolaMetrichePerCondizione, classificaPP, classificaER } from './metriche';

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
  giocatoreId: number;
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
 */
export function generaAnalisiCompleta(
  giocatoreId: number,
  giocatoreNome: string,
  tuttiIColpi: Colpo[]
): AnalisiGiocatore {
  const colpiGiocatore = tuttiIColpi.filter(c => (c as any).playerIndex === giocatoreId);
  const totaleColpi = colpiGiocatore.length;

  // Dati insufficienti
  if (totaleColpi < 5) {
    return {
      giocatoreId,
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

  // Punti di forza - dove ci sono molti esiti POSITIVI (#, +)
  const puntiDiForza = {
    migliorEsito: trovaMigliore(perEsito)?.nome || null,
    migliorZona: trovaCondizioneConPiuPositivi(colpiGiocatore, 'side'),
    migliorDirezione: trovaCondizioneConPiuPositivi(colpiGiocatore, 'direction'),
    migliorProvenienza: trovaCondizioneConPiuPositivi(colpiGiocatore, 'serveZone'),
    migliorVelocita: trovaCondizioneConPiuPositivi(colpiGiocatore, 'speedCategory'),
    migliorTipologia: trovaCondizioneConPiuPositivi(colpiGiocatore, 'serveTypology'),
    combinazioneMigliore: trovaCombinazioneConPiuPositivi(colpiGiocatore),
    caratteristichePositivita: analizzaCaratteristichePositivita(colpiGiocatore),
  };

  // Punti deboli - dove ci sono molti esiti NEGATIVI (=, /, -)
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

  // Sintesi
  const sintesi = generaSintesi(giocatoreNome, metricheGlobali, puntiDiForza, puntiDeboli);

  return {
    giocatoreId,
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
 */
function trovaCondizioneConPiuPositivi(colpi: Colpo[], chiave: keyof Colpo): string | null {
  const valori = [...new Set(colpi.map(c => c[chiave]).filter(v => v !== undefined && v !== 'non-specificata'))];
  
  let maxPositivi = 0;
  let condizioneMigliore: string | null = null;
  
  valori.forEach(valore => {
    const colpiCondizione = colpi.filter(c => c[chiave] === valore);
    if (colpiCondizione.length < 3) return;
    
    const positivi = colpiCondizione.filter(c => c.outcome === '#' || c.outcome === '+').length;
    if (positivi > maxPositivi) {
      maxPositivi = positivi;
      condizioneMigliore = String(valore);
    }
  });
  
  return condizioneMigliore;
}

/**
 * Trova la condizione con più esiti NEGATIVI (=, /, -)
 */
function trovaCondizioneConPiuNegativi(colpi: Colpo[], chiave: keyof Colpo): string | null {
  const valori = [...new Set(colpi.map(c => c[chiave]).filter(v => v !== undefined && v !== 'non-specificata'))];
  
  let maxNegativi = 0;
  let condizionePeggiore: string | null = null;
  
  valori.forEach(valore => {
    const colpiCondizione = colpi.filter(c => c[chiave] === valore);
    if (colpiCondizione.length < 3) return;
    
    const negativi = colpiCondizione.filter(c => c.outcome === '=' || c.outcome === '/' || c.outcome === '-').length;
    if (negativi > maxNegativi) {
      maxNegativi = negativi;
      condizionePeggiore = String(valore);
    }
  });
  
  return condizionePeggiore;
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
 * Analizza le caratteristiche delle negatività
 */
function analizzaCaratteristicheNegativita(colpi: Colpo[]): string {
  const negativi = colpi.filter(c => c.outcome === '=' || c.outcome === '/' || c.outcome === '-');
  if (negativi.length === 0) return '';
  
  const caratteristiche: string[] = [];
  
  // Velocità più frequente nei negativi
  const velocitaCount: Record<string, number> = {};
  negativi.forEach(c => {
    if (c.speedCategory && c.speedCategory !== 'non-specificata') {
      velocitaCount[c.speedCategory] = (velocitaCount[c.speedCategory] || 0) + 1;
    }
  });
  const velocitaPiuFrequente = Object.entries(velocitaCount).sort((a, b) => b[1] - a[1])[0];
  if (velocitaPiuFrequente) {
    caratteristiche.push(`battute ${velocitaPiuFrequente[0].toLowerCase()}`);
  }
  
  // Provenienza più frequente nei negativi
  const provCount: Record<number, number> = {};
  negativi.forEach(c => {
    if (c.serveZone) {
      provCount[c.serveZone] = (provCount[c.serveZone] || 0) + 1;
    }
  });
  const provPiuFrequente = Object.entries(provCount).sort((a, b) => b[1] - a[1])[0];
  if (provPiuFrequente) {
    caratteristiche.push(`dalla zona ${provPiuFrequente[0]}`);
  }
  
  // Zona di campo più frequente nei negativi
  const zonaCount: Record<string, number> = {};
  negativi.forEach(c => {
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

function trovaEsitoNegativoPrevalente(colpi: Colpo[]): string | null {
  const errori = colpi.filter(c => c.outcome === '=').length;
  const slash = colpi.filter(c => c.outcome === '/').length;
  const negativi = colpi.filter(c => c.outcome === '-').length;
  
  if (errori === 0 && slash === 0 && negativi === 0) return null;
  
  if (errori >= slash && errori >= negativi) return 'Errore';
  if (slash >= errori && slash >= negativi) return 'Slash';
  return 'Negativa';
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
  metriche: { pp: number; er: number },
  puntiDiForza: any,
  puntiDeboli: any
): string {
  const classER = classificaER(metriche.er);
  const giudizioER = classER === 'ottimo' ? 'Ottima' : classER === 'buono' ? 'Buona' : classER === 'migliorare' ? 'Da migliorare' : 'Insufficiente';
  
  let sintesi = `${nome} ha un'efficienza del ${metriche.er.toFixed(0)}% (${giudizioER}). La percentuale positiva è del ${metriche.pp.toFixed(0)}%. `;
  
  // Punti di forza basati sulle EVIDENZE POSITIVE
  if (puntiDiForza.caratteristichePositivita) {
    sintesi += `Eccelle su ${puntiDiForza.caratteristichePositivita}, dove produce molti esiti positivi. `;
  } else if (puntiDiForza.combinazioneMigliore) {
    sintesi += `Eccelle su ${puntiDiForza.combinazioneMigliore}. `;
  }
  
  // Punti deboli basati sulle EVIDENZE NEGATIVE
  if (puntiDeboli.caratteristicheNegativita) {
    sintesi += `Ma ha difficoltà su ${puntiDeboli.caratteristicheNegativita}, dove si accumulano esiti negativi. `;
  } else if (puntiDeboli.combinazionePeggiore) {
    sintesi += `Ma ha difficoltà su ${puntiDeboli.combinazionePeggiore}. `;
  }
  
  // Raccomandazione basata sulle criticità
  if (puntiDeboli.caratteristicheNegativita || puntiDeboli.velocitaCritica || puntiDeboli.provenienzaCritica) {
    sintesi += `RACCOMANDAZIONE: Concentrare gli allenamenti su `;
    const parti = [];
    if (puntiDeboli.velocitaCritica) parti.push(`battute ${puntiDeboli.velocitaCritica.toLowerCase()}`);
    if (puntiDeboli.provenienzaCritica) parti.push(`dalla ${puntiDeboli.provenienzaCritica}`);
    if (puntiDeboli.zonaCritica) parti.push(`verso il ${puntiDeboli.zonaCritica.toLowerCase()}`);
    if (parti.length > 0) {
      sintesi += parti.join(' ') + ', dove si concentrano le negatività.';
    } else {
      sintesi += 'le situazioni che generano più esiti negativi.';
    }
  }
  
  return sintesi;
}
