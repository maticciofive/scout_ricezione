import React, { useState } from 'react';
import { generaDatiTabellaIncrociata, generaDatiTabellaIncrociataTotale, DatiTabellaGiocatore } from '../utils/tabellaIncrociata';
import './TabellaAnalisiIncrociata.css';

interface Colpo {
  playerIndex: number;
  side?: string;
  serveTypology?: string;
  outcome: string;
}

interface Giocatore {
  id: number;
  name: string;
}

interface TabellaAnalisiIncrociataProps {
  giocatori: Giocatore[];
  colpi: Colpo[];
}

const ZONE_RICEZIONE = ['Sinistra', 'Centro', 'Destra'];
const TIPOLOGIE_BATTUTA = ['Flottante', 'Jump Top Spin', 'Jump Flottante', 'Non specificata'];

export default function TabellaAnalisiIncrociata({ giocatori, colpi }: TabellaAnalisiIncrociataProps) {
  const [giocatoreSelezionato, setGiocatoreSelezionato] = useState<string>('tutti');

  // Genera i dati in base alla selezione
  let datiTabella: DatiTabellaGiocatore;
  
  if (giocatoreSelezionato === 'tutti') {
    datiTabella = generaDatiTabellaIncrociataTotale(colpi);
  } else {
    const datiTutti = generaDatiTabellaIncrociata(colpi, giocatori);
    datiTabella = datiTutti[giocatoreSelezionato];
  }

  // Funzione helper per formattare la percentuale
  const formatPercentuale = (valore: number, totale: number): string => {
    if (totale === 0) return '-';
    return `${valore.toFixed(1)}%`;
  };

  // Funzione helper per determinare la classe CSS in base al valore
  const getClasseCella = (tipo: string, valore: number, totale: number): string => {
    if (totale === 0) return 'cella-vuota';
    
    if (tipo === 'errore' && valore >= 15) {
      return 'cella-errore-critico'; // Rosso
    }
    
    if (tipo === 'perfetta' || tipo === 'positiva') {
      // Calcola la somma di perfetta + positiva
      return ''; // La logica di evidenziazione verde sarà gestita a livello di riga
    }
    
    return '';
  };

  // Calcola la somma di positiva + perfetta per una cella
  const calcolaSommaPositiva = (cella: any): number => {
    return cella.esiti.perfetta + cella.esiti.positiva;
  };

  return (
    <div className="tabella-incrociata-container">
      <div className="tabella-incrociata-header">
        <h2 className="tabella-incrociata-titolo">📊 Analisi Incrociata: Zona × Tipologia</h2>
        
        <div className="tabella-incrociata-filtro">
          <label htmlFor="giocatore-select">Giocatore:</label>
          <select
            id="giocatore-select"
            value={giocatoreSelezionato}
            onChange={(e) => setGiocatoreSelezionato(e.target.value)}
            className="tabella-incrociata-select"
          >
            <option value="tutti">Tutti i giocatori</option>
            {giocatori.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tabella-incrociata-wrapper">
        <table className="tabella-incrociata">
          <thead>
            <tr>
              <th rowSpan={2} className="colonna-zona">Zona</th>
              <th rowSpan={2} className="colonna-tipologia">Tipologia</th>
              <th rowSpan={2} className="colonna-totale">Tot</th>
              <th colSpan={6} className="header-esiti">Esiti (%)</th>
            </tr>
            <tr>
              <th className="header-esito perfetta">#</th>
              <th className="header-esito positiva">+</th>
              <th className="header-esito esclamativa">!</th>
              <th className="header-esito negativa">-</th>
              <th className="header-esito slash">/</th>
              <th className="header-esito errore">=</th>
            </tr>
          </thead>
          <tbody>
            {ZONE_RICEZIONE.map((zona) => {
              const tipologieConDati = TIPOLOGIE_BATTUTA.filter(tipologia => {
                const cella = datiTabella.dati[zona]?.[tipologia];
                return cella && cella.totale > 0;
              });

              // Se non ci sono dati per questa zona, mostra comunque una riga con "Non specificata"
              if (tipologieConDati.length === 0) {
                const cella = datiTabella.dati[zona]?.['Non specificata'];
                if (cella && cella.totale > 0) {
                  tipologieConDati.push('Non specificata');
                }
              }

              return tipologieConDati.map((tipologia, index) => {
                const cella = datiTabella.dati[zona]?.[tipologia];
                
                if (!cella || cella.totale === 0) {
                  return null;
                }

                const sommaPositiva = calcolaSommaPositiva(cella);
                const classeRiga = sommaPositiva >= 60 ? 'riga-positiva' : '';

                return (
                  <tr key={`${zona}-${tipologia}`} className={classeRiga}>
                    {index === 0 && (
                      <td rowSpan={tipologieConDati.length} className="cella-zona">
                        {zona}
                      </td>
                    )}
                    <td className="cella-tipologia">{tipologia}</td>
                    <td className="cella-totale">{cella.totale}</td>
                    <td className={cella.esiti.perfetta > 0 ? 'cella-perfetta' : ''}>
                      {formatPercentuale(cella.esiti.perfetta, cella.totale)}
                    </td>
                    <td className={cella.esiti.positiva > 0 ? 'cella-positiva' : ''}>
                      {formatPercentuale(cella.esiti.positiva, cella.totale)}
                    </td>
                    <td className={cella.esiti.esclamativa > 0 ? 'cella-esclamativa' : ''}>
                      {formatPercentuale(cella.esiti.esclamativa, cella.totale)}
                    </td>
                    <td className={cella.esiti.negativa > 0 ? 'cella-negativa' : ''}>
                      {formatPercentuale(cella.esiti.negativa, cella.totale)}
                    </td>
                    <td className={cella.esiti.slash > 0 ? 'cella-slash' : ''}>
                      {formatPercentuale(cella.esiti.slash, cella.totale)}
                    </td>
                    <td className={cella.esiti.errore >= 15 ? 'cella-errore-critico' : cella.esiti.errore > 0 ? 'cella-errore' : ''}>
                      {formatPercentuale(cella.esiti.errore, cella.totale)}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      <div className="tabella-incrociata-legenda">
        <div className="legenda-item">
          <span className="legenda-color cella-errore-critico"></span>
          <span>Errore (≥15%)</span>
        </div>
        <div className="legenda-item">
          <span className="legenda-color riga-positiva-sample"></span>
          <span>Positiva (≥60%)</span>
        </div>
      </div>
    </div>
  );
}
