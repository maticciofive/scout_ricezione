/**
 * Logica di aggregazione per la tabella di analisi incrociata
 * Incrocia Zona di ricezione e Tipologia di battuta
 */

export interface CellaIncrociata {
  totale: number;
  esiti: {
    perfetta: number;    // percentuale
    positiva: number;    // percentuale
    esclamativa: number; // percentuale
    negativa: number;    // percentuale (SOLO '-')
    slash: number;       // percentuale
    errore: number;      // percentuale (SOLO '=')
  };
}

export interface DatiTabellaGiocatore {
  giocatoreNome: string;
  dati: Record<string, Record<string, CellaIncrociata>>;
  // Esempio chiave: dati['Destra']['Jump Top Spin']
}

const ZONE_RICEZIONE = ['Sinistra', 'Centro', 'Destra'];
const TIPOLOGIE_BATTUTA = ['Flottante', 'Jump Top Spin', 'Jump Flottante', 'Non specificata'];

/**
 * Genera i dati aggregati per la tabella incrociata
 * @param tuttiIColpi - Array di tutti i colpi con playerIndex, side, serveTypology, outcome
 * @param giocatori - Array dei giocatori con id e name
 * @returns Record con chiave = nome giocatore, valore = dati tabella
 */
export function generaDatiTabellaIncrociata(
  tuttiIColpi: any[],
  giocatori: { id: number; name: string }[]
): Record<string, DatiTabellaGiocatore> {
  const risultato: Record<string, DatiTabellaGiocatore> = {};

  // Per ogni giocatore
  giocatori.forEach((giocatore, index) => {
    // Filtra i colpi di questo giocatore
    const colpiGiocatore = tuttiIColpi.filter(c => c.playerIndex === index);
    
    // Inizializza la struttura dati
    const dati: Record<string, Record<string, CellaIncrociata>> = {};
    
    ZONE_RICEZIONE.forEach(zona => {
      dati[zona] = {};
      TIPOLOGIE_BATTUTA.forEach(tipologia => {
        // Filtra i colpi per questa zona e tipologia
        const colpiFiltrati = colpiGiocatore.filter(c => {
          const matchZona = c.side === zona;
          const matchTipologia = c.serveTypology === tipologia || 
                                (tipologia === 'Non specificata' && (!c.serveTypology || c.serveTypology === 'Non specificata'));
          return matchZona && matchTipologia;
        });
        
        const totale = colpiFiltrati.length;
        
        if (totale === 0) {
          // Nessuna ricezione: tutte le percentuali a 0
          dati[zona][tipologia] = {
            totale: 0,
            esiti: {
              perfetta: 0,
              positiva: 0,
              esclamativa: 0,
              negativa: 0,
              slash: 0,
              errore: 0,
            },
          };
        } else {
          // Calcola le percentuali per ogni esito
          const perfetta = colpiFiltrati.filter(c => c.outcome === '#').length;
          const positiva = colpiFiltrati.filter(c => c.outcome === '+').length;
          const esclamativa = colpiFiltrati.filter(c => c.outcome === '!').length;
          const negativa = colpiFiltrati.filter(c => c.outcome === '-').length; // SOLO '-'
          const slash = colpiFiltrati.filter(c => c.outcome === '/').length;
          const errore = colpiFiltrati.filter(c => c.outcome === '=').length; // SOLO '='
          
          dati[zona][tipologia] = {
            totale,
            esiti: {
              perfetta: Math.round((perfetta / totale) * 1000) / 10, // 1 decimale
              positiva: Math.round((positiva / totale) * 1000) / 10,
              esclamativa: Math.round((esclamativa / totale) * 1000) / 10,
              negativa: Math.round((negativa / totale) * 1000) / 10,
              slash: Math.round((slash / totale) * 1000) / 10,
              errore: Math.round((errore / totale) * 1000) / 10,
            },
          };
        }
      });
    });
    
    risultato[giocatore.name] = {
      giocatoreNome: giocatore.name,
      dati,
    };
  });
  
  return risultato;
}

/**
 * Genera i dati aggregati per TUTTI i giocatori combinati
 */
export function generaDatiTabellaIncrociataTotale(
  tuttiIColpi: any[]
): DatiTabellaGiocatore {
  const dati: Record<string, Record<string, CellaIncrociata>> = {};
  
  ZONE_RICEZIONE.forEach(zona => {
    dati[zona] = {};
    TIPOLOGIE_BATTUTA.forEach(tipologia => {
      const colpiFiltrati = tuttiIColpi.filter(c => {
        const matchZona = c.side === zona;
        const matchTipologia = c.serveTypology === tipologia || 
                              (tipologia === 'Non specificata' && (!c.serveTypology || c.serveTypology === 'Non specificata'));
        return matchZona && matchTipologia;
      });
      
      const totale = colpiFiltrati.length;
      
      if (totale === 0) {
        dati[zona][tipologia] = {
          totale: 0,
          esiti: {
            perfetta: 0,
            positiva: 0,
            esclamativa: 0,
            negativa: 0,
            slash: 0,
            errore: 0,
          },
        };
      } else {
        const perfetta = colpiFiltrati.filter(c => c.outcome === '#').length;
        const positiva = colpiFiltrati.filter(c => c.outcome === '+').length;
        const esclamativa = colpiFiltrati.filter(c => c.outcome === '!').length;
        const negativa = colpiFiltrati.filter(c => c.outcome === '-').length;
        const slash = colpiFiltrati.filter(c => c.outcome === '/').length;
        const errore = colpiFiltrati.filter(c => c.outcome === '=').length;
        
        dati[zona][tipologia] = {
          totale,
          esiti: {
            perfetta: Math.round((perfetta / totale) * 1000) / 10,
            positiva: Math.round((positiva / totale) * 1000) / 10,
            esclamativa: Math.round((esclamativa / totale) * 1000) / 10,
            negativa: Math.round((negativa / totale) * 1000) / 10,
            slash: Math.round((slash / totale) * 1000) / 10,
            errore: Math.round((errore / totale) * 1000) / 10,
          },
        };
      }
    });
  });
  
  return {
    giocatoreNome: 'Tutti i giocatori',
    dati,
  };
}
