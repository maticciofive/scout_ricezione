/**
 * Tabella di corrispondenza Direzione × Esito
 * NUOVO FILE - Analisi incrociata direzione palla vs esito ricezione
 */

import React, { useState } from 'react';
import './TabellaDirezioneEsito.css';

interface Colpo {
  playerIndex: number;
  side?: string;
  direction?: string;
  outcome: string;
}

interface Giocatore {
  id: number;
  name: string;
  zone: number;
}

interface TabellaDirezioneEsitoProps {
  giocatori: Giocatore[];
  colpi: Colpo[];
}

// Definizione dei lati del campo
const LATI_CAMPO = [
  { nome: 'Destra', zone: [1, 9, 2], descrizione: 'Lato destro del campo (1-9-2)' },
  { nome: 'Centro', zone: [6, 8, 3], descrizione: 'Lato centrale del campo (6-8-3)' },
  { nome: 'Sinistra', zone: [5, 7, 4], descrizione: 'Lato sinistro del campo (5-7-4)' },
];

// Direzioni della palla rispetto al corpo
const DIREZIONI_CORPO = [
  { key: 'up', label: 'Avanti', symbol: '▲' },
  { key: 'down', label: 'Dietro', symbol: '▼' },
  { key: 'left', label: 'Sinistro', symbol: '◀' },
  { key: 'right', label: 'Destro', symbol: '▶' },
  { key: 'center', label: 'Corpo', symbol: '●' },
];

// Esiti della ricezione
const ESITI = [
  { key: '#', label: 'Perfetta', color: '#22c55e' },
  { key: '+', label: 'Positiva', color: '#86efac' },
  { key: '!', label: 'Esclamativa', color: '#facc15' },
  { key: '-', label: 'Negativa', color: '#fb923c' },
  { key: '/', label: 'Slash', color: '#9ca3af' },
  { key: '=', label: 'Errore', color: '#ef4444' },
];

export default function TabellaDirezioneEsito({ giocatori, colpi }: TabellaDirezioneEsitoProps) {
  const [latoSelezionato, setLatoSelezionato] = useState<string>('tutti');
  const [giocatoreSelezionato, setGiocatoreSelezionato] = useState<string>('tutti');

  // Filtra i colpi per lato del campo e giocatore
  const filtraColpiPerLato = (lati: string[]) => {
    return colpi.filter(c => {
      // Filtro per giocatore
      if (giocatoreSelezionato !== 'tutti' && c.playerIndex !== parseInt(giocatoreSelezionato)) {
        return false;
      }
      
      // Filtro per lato del campo
      if (lati.length === 0) return true;
      
      // Trova il lato del campo in base alla zona del giocatore
      const giocatore = giocatori[c.playerIndex];
      if (!giocatore) return false;
      
      // La zona del giocatore determina il lato
      const zonaGiocatore = giocatore.zone;
      return lati.some(lato => {
        const latoDef = LATI_CAMPO.find(l => l.nome === lato);
        return latoDef && latoDef.zone.includes(zonaGiocatore);
      });
    });
  };

  // Calcola le statistiche per direzione × esito
  const calcolaStatistiche = (colpiFiltrati: Colpo[]) => {
    const stats: Record<string, Record<string, { count: number; percentage: number }>> = {};
    
    DIREZIONI_CORPO.forEach(dir => {
      stats[dir.key] = {};
      const colpiDirezione = colpiFiltrati.filter(c => c.direction === dir.key);
      const totaleDirezione = colpiDirezione.length;
      
      ESITI.forEach(esito => {
        const count = colpiDirezione.filter(c => c.outcome === esito.key).length;
        const percentage = totaleDirezione > 0 ? (count / totaleDirezione) * 100 : 0;
        stats[dir.key][esito.key] = { count, percentage };
      });
    });
    
    return stats;
  };

  // Determina quali lati mostrare
  const latiDaMostrare = latoSelezionato === 'tutti' 
    ? LATI_CAMPO 
    : LATI_CAMPO.filter(l => l.nome === latoSelezionato);

  return (
    <div className="tabella-direzione-esito-container">
      <div className="tabella-direzione-esito-header">
        <h2 className="tabella-direzione-esito-titolo">
          📊 Corrispondenza Direzione × Esito per Lato
        </h2>
        
        <div className="tabella-direzione-esito-filtri">
          <div className="tabella-direzione-esito-filtro">
            <label htmlFor="giocatore-select">Giocatore:</label>
            <select
              id="giocatore-select"
              value={giocatoreSelezionato}
              onChange={(e) => setGiocatoreSelezionato(e.target.value)}
              className="tabella-direzione-esito-select"
            >
              <option value="tutti">Tutti i giocatori</option>
              {giocatori.map((giocatore, index) => (
                <option key={giocatore.id} value={index.toString()}>
                  {giocatore.name}
                </option>
              ))}
            </select>
          </div>

          <div className="tabella-direzione-esito-filtro">
            <label htmlFor="lato-select">Lato del campo:</label>
            <select
              id="lato-select"
              value={latoSelezionato}
              onChange={(e) => setLatoSelezionato(e.target.value)}
              className="tabella-direzione-esito-select"
            >
              <option value="tutti">Tutti i lati</option>
              {LATI_CAMPO.map((lato) => (
                <option key={lato.nome} value={lato.nome}>
                  {lato.nome} ({lato.zone.join('-')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="tabella-direzione-esito-content">
        {latiDaMostrare.map((lato) => {
          const colpiLato = filtraColpiPerLato([lato.nome]);
          const stats = calcolaStatistiche(colpiLato);
          const totaleLato = colpiLato.length;
          
          // Determina il nome del giocatore o "Tutti i giocatori"
          const nomeGiocatore = giocatoreSelezionato === 'tutti' 
            ? 'Tutti i giocatori'
            : giocatori[parseInt(giocatoreSelezionato)]?.name || 'Giocatore sconosciuto';

          return (
            <div key={lato.nome} className="tabella-lato-section">
              <h3 className="tabella-lato-titolo">
                {lato.descrizione} - {nomeGiocatore}
                <span className="tabella-lato-totale">
                  Totale: {totaleLato} ricezioni
                </span>
              </h3>

              {totaleLato === 0 ? (
                <div className="tabella-vuota">
                  Nessuna ricezione registrata per questo lato
                </div>
              ) : (
                <div className="tabella-wrapper">
                  <table className="tabella-direzione-esito">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="colonna-direzione">
                          Direzione Palla
                        </th>
                        <th colSpan={ESITI.length} className="header-esiti">
                          Esiti della Ricezione
                        </th>
                      </tr>
                      <tr>
                        {ESITI.map((esito) => (
                          <th 
                            key={esito.key} 
                            className="header-esito"
                            style={{ backgroundColor: esito.color }}
                          >
                            {esito.key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DIREZIONI_CORPO.map((dir) => (
                        <tr key={dir.key}>
                          <td className="cella-direzione">
                            <span className="direzione-symbol">{dir.symbol}</span>
                            <span className="direzione-label">{dir.label}</span>
                          </td>
                          {ESITI.map((esito) => {
                            const stat = stats[dir.key][esito.key];
                            return (
                              <td 
                                key={esito.key} 
                                className="cella-esito"
                                style={{
                                  backgroundColor: stat.percentage > 0 
                                    ? `${esito.color}20` 
                                    : 'transparent'
                                }}
                              >
                                <div className="esito-count">{stat.count}</div>
                                <div className="esito-percentage">
                                  {stat.percentage.toFixed(1)}%
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
