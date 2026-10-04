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
  };
  puntiDeboli: {
    esitoNegativoPrevalente: string | null;
    zonaCritica: string | null;
    direzioneCritica: string | null;
    provenienzaCritica: string | null;
    velocitaCritica: string | null;
    tipologiaCritica: string | null;
    combinazionePeggiore: string | null;
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
      },
      puntiDeboli: {
        esitoNegativoPrevalente: null,
        zonaCritica: null,
        direzioneCritica: null,
        provenienzaCritica: null,
        velocitaCritica: null,
        tipologiaCritica: null,
        combinazionePeggiore: null,
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

  // Punti di forza
  const puntiDiForza = {
    migliorEsito: trovaMigliore(perEsito)?.nome || null,
    migliorZona: trovaMigliore(perZona)?.nome || null,
    migliorDirezione: trovaMigliore(perDirezione)?.nome || null,
    migliorProvenienza: trovaMigliore(perProvenienza)?.nome || null,
    migliorVelocita: trovaMigliore(perVelocita)?.nome || null,
    migliorTipologia: trovaMigliore(perTipologia)?.nome || null,
    combinazioneMigliore: trovaCombinazioneMigliore(colpiGiocatore),
  };

  // Punti deboli
  const puntiDeboli = {
    esitoNegativoPrevalente: trovaEsitoNegativoPrevalente(colpiGiocatore),
    zonaCritica: trovaPeggiore(perZona)?.nome || null,
    direzioneCritica: trovaPeggiore(perDirezione)?.nome || null,
    provenienzaCritica: trovaPeggiore(perProvenienza)?.nome || null,
    velocitaCritica: trovaPeggiore(perVelocita)?.nome || null,
    tipologiaCritica: trovaPeggiore(perTipologia)?.nome || null,
    combinazionePeggiore: trovaCombinazionePeggiore(colpiGiocatore),
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
  
  if (puntiDiForza.combinazioneMigliore) {
    sintesi += `Eccelle su ${puntiDiForza.combinazioneMigliore}. `;
  }
  
  if (puntiDeboli.combinazionePeggiore) {
    sintesi += `Ma ha difficoltà su ${puntiDeboli.combinazionePeggiore}. `;
  }
  
  if (puntiDeboli.velocitaCritica || puntiDeboli.provenienzaCritica) {
    sintesi += `Raccomandazione: concentrare gli allenamenti su `;
    const parti = [];
    if (puntiDeboli.velocitaCritica) parti.push(`battute ${puntiDeboli.velocitaCritica.toLowerCase()}`);
    if (puntiDeboli.provenienzaCritica) parti.push(`dalla ${puntiDeboli.provenienzaCritica}`);
    if (puntiDeboli.zonaCritica) parti.push(`verso il ${puntiDeboli.zonaCritica.toLowerCase()}`);
    sintesi += parti.join(' ') + '.';
  }
  
  return sintesi;
}
