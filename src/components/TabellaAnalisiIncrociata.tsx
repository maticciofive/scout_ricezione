import React, { useState } from 'react';
import './TabellaAnalisiIncrociata.css';

interface Colpo {
  playerIndex: number;
  side?: string;
  serveTypology?: string;
  serveZone?: number;
  serveType?: string;
  zone?: number;
  fundamental?: string;
  direction?: string;
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

// Costanti per i filtri
const ZONE_RICEZIONE = ['Sinistra', 'Centro', 'Destra'];
const TIPOLOGIE_BATTUTA = ['Flottante', 'Jump Top Spin', 'Jump Flottante'];
const ZONE_BATTUTA = [1, 5, 6];
const TIPI_BATTUTA = ['F', 'SF', 'SS', 'SP', 'FL'];
const ZONE_CAMPO = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// FIX: I fondamentali sono salvati come 'B' e 'P', non come nomi completi
const FONDAMENTALI = [
  { key: 'B', label: 'Bagher' },
  { key: 'P', label: 'Palleggio' }
];
// FIX: Le direzioni sono salvate come 'up', 'left', 'center', 'right', 'down'
const DIREZIONI = [
  { key: 'up', symbol: '▲', label: 'Avanti' },
  { key: 'left', symbol: '◀', label: 'Sinistra' },
  { key: 'center', symbol: '●', label: 'Centro' },
  { key: 'right', symbol: '▶', label: 'Destra' },
  { key: 'down', symbol: '▼', label: 'Dietro' }
];

export default function TabellaAnalisiIncrociata({ giocatori, colpi }: TabellaAnalisiIncrociataProps) {
  // Stati per i filtri
  const [giocatoreSelezionato, setGiocatoreSelezionato] = useState<string>('tutti');
  const [zonaRicezioneFiltro, setZonaRicezioneFiltro] = useState<string>('tutte');
  const [tipologiaFiltro, setTipologiaFiltro] = useState<string>('tutte');
  const [zonaBattutaFiltro, setZonaBattutaFiltro] = useState<number | 'tutte'>('tutte');
  const [tipoBattutaFiltro, setTipoBattutaFiltro] = useState<string>('tutti');
  const [zonaCampoFiltro, setZonaCampoFiltro] = useState<number | 'tutte'>('tutte');
  const [fondamentaleFiltro, setFondamentaleFiltro] = useState<string>('tutti');
  const [direzioneFiltro, setDirezioneFiltro] = useState<string>('tutte');

  // Applica tutti i filtri ai colpi
  const colpiFiltrati = colpi.filter(c => {
    // Filtro giocatore
    if (giocatoreSelezionato !== 'tutti' && c.playerIndex !== giocatori.findIndex(g => g.name === giocatoreSelezionato)) {
      return false;
    }
    
    // Filtro zona ricezione
    if (zonaRicezioneFiltro !== 'tutte' && c.side !== zonaRicezioneFiltro) {
      return false;
    }
    
    // Filtro tipologia
    if (tipologiaFiltro !== 'tutte' && c.serveTypology !== tipologiaFiltro) {
      return false;
    }
    
    // Filtro zona battuta
    if (zonaBattutaFiltro !== 'tutte' && c.serveZone !== zonaBattutaFiltro) {
      return false;
    }
    
    // Filtro tipo battuta
    if (tipoBattutaFiltro !== 'tutti' && c.serveType !== tipoBattutaFiltro) {
      return false;
    }
    
    // Filtro zona campo
    if (zonaCampoFiltro !== 'tutte' && c.zone !== zonaCampoFiltro) {
      return false;
    }
    
    // Filtro fondamentale
    if (fondamentaleFiltro !== 'tutti' && c.fundamental !== fondamentaleFiltro) {
      return false;
    }
    
    // Filtro direzione
    if (direzioneFiltro !== 'tutte' && c.direction !== direzioneFiltro) {
      return false;
    }
    
    return true;
  });

  // Calcola le statistiche per la tabella
  const calcolaStatistiche = () => {
    const risultati: { zona: string; tipologia: string; totale: number; esiti: any }[] = [];
    
    ZONE_RICEZIONE.forEach(zona => {
      TIPOLOGIE_BATTUTA.forEach(tipologia => {
        const colpiCella = colpiFiltrati.filter(c => c.side === zona && c.serveTypology === tipologia);
        const totale = colpiCella.length;
        
        if (totale > 0) {
          const perfetta = colpiCella.filter(c => c.outcome === '#').length;
          const positiva = colpiCella.filter(c => c.outcome === '+').length;
          const esclamativa = colpiCella.filter(c => c.outcome === '!').length;
          const negativa = colpiCella.filter(c => c.outcome === '-').length;
          const slash = colpiCella.filter(c => c.outcome === '/').length;
          const errore = colpiCella.filter(c => c.outcome === '=').length;
          
          risultati.push({
            zona,
            tipologia,
            totale,
            esiti: {
              perfetta: Math.round((perfetta / totale) * 1000) / 10,
              positiva: Math.round((positiva / totale) * 1000) / 10,
              esclamativa: Math.round((esclamativa / totale) * 1000) / 10,
              negativa: Math.round((negativa / totale) * 1000) / 10,
              slash: Math.round((slash / totale) * 1000) / 10,
              errore: Math.round((errore / totale) * 1000) / 10,
            }
          });
        }
      });
    });
    
    return risultati;
  };

  const statistiche = calcolaStatistiche();

  // Funzione helper per formattare la percentuale
  const formatPercentuale = (valore: number): string => {
    return `${valore.toFixed(1)}%`;
  };

  // Resetta tutti i filtri
  const resettaFiltri = () => {
    setGiocatoreSelezionato('tutti');
    setZonaRicezioneFiltro('tutte');
    setTipologiaFiltro('tutte');
    setZonaBattutaFiltro('tutte');
    setTipoBattutaFiltro('tutti');
    setZonaCampoFiltro('tutte');
    setFondamentaleFiltro('tutti');
    setDirezioneFiltro('tutte');
  };

  return (
    <div className="tabella-incrociata-container">
      <div className="tabella-incrociata-header">
        <h2 className="tabella-incrociata-titolo">📊 Analisi Incrociata Avanzata</h2>
      </div>

      {/* Sezione Filtri */}
      <div className="filtri-container">
        <div className="filtri-grid">
          {/* Filtro Giocatore */}
          <div className="filtro-item">
            <label>Giocatore:</label>
            <select
              value={giocatoreSelezionato}
              onChange={(e) => setGiocatoreSelezionato(e.target.value)}
              className="filtro-select"
            >
              <option value="tutti">Tutti i giocatori</option>
              {giocatori.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Zona Ricezione */}
          <div className="filtro-item">
            <label>Zona Ricezione:</label>
            <select
              value={zonaRicezioneFiltro}
              onChange={(e) => setZonaRicezioneFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="tutte">Tutte le zone</option>
              {ZONE_RICEZIONE.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tipologia */}
          <div className="filtro-item">
            <label>Tipologia Battuta:</label>
            <select
              value={tipologiaFiltro}
              onChange={(e) => setTipologiaFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="tutte">Tutte le tipologie</option>
              {TIPOLOGIE_BATTUTA.map((tipologia) => (
                <option key={tipologia} value={tipologia}>
                  {tipologia}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Zona Battuta */}
          <div className="filtro-item">
            <label>Zona Battuta:</label>
            <select
              value={zonaBattutaFiltro}
              onChange={(e) => setZonaBattutaFiltro(e.target.value === 'tutte' ? 'tutte' : parseInt(e.target.value))}
              className="filtro-select"
            >
              <option value="tutte">Tutte le zone</option>
              {ZONE_BATTUTA.map((zona) => (
                <option key={zona} value={zona}>
                  Zona {zona}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tipo Battuta */}
          <div className="filtro-item">
            <label>Tipo Battuta:</label>
            <select
              value={tipoBattutaFiltro}
              onChange={(e) => setTipoBattutaFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="tutti">Tutti i tipi</option>
              {TIPI_BATTUTA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Zona Campo */}
          <div className="filtro-item">
            <label>Zona Campo:</label>
            <select
              value={zonaCampoFiltro}
              onChange={(e) => setZonaCampoFiltro(e.target.value === 'tutte' ? 'tutte' : parseInt(e.target.value))}
              className="filtro-select"
            >
              <option value="tutte">Tutte le zone</option>
              {ZONE_CAMPO.map((zona) => (
                <option key={zona} value={zona}>
                  Zona {zona}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Fondamentale */}
          <div className="filtro-item">
            <label>Fondamentale:</label>
            <select
              value={fondamentaleFiltro}
              onChange={(e) => setFondamentaleFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="tutti">Tutti i fondamentali</option>
              {FONDAMENTALI.map((fond) => (
                <option key={fond.key} value={fond.key}>
                  {fond.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Direzione */}
          <div className="filtro-item">
            <label>Direzione:</label>
            <select
              value={direzioneFiltro}
              onChange={(e) => setDirezioneFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="tutte">Tutte le direzioni</option>
              {DIREZIONI.map((dir) => (
                <option key={dir.key} value={dir.key}>
                  {dir.symbol} {dir.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pulsante Reset */}
        <button onClick={resettaFiltri} className="reset-btn">
          🔄 Resetta Filtri
        </button>
      </div>

      {/* Info risultati */}
      <div className="risultati-info">
        <p>Totale ricezioni filtrate: <strong>{colpiFiltrati.length}</strong></p>
      </div>

      {/* Tabella */}
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
            {statistiche.length === 0 ? (
              <tr>
                <td colSpan={9} className="nessun-dato">
                  Nessun dato disponibile per i filtri selezionati
                </td>
              </tr>
            ) : (
              statistiche.map((stat, index) => {
                const sommaPositiva = stat.esiti.perfetta + stat.esiti.positiva;
                const classeRiga = sommaPositiva >= 60 ? 'riga-positiva' : '';
                
                return (
                  <tr key={index} className={classeRiga}>
                    <td className="cella-zona">{stat.zona}</td>
                    <td className="cella-tipologia">{stat.tipologia}</td>
                    <td className="cella-totale">{stat.totale}</td>
                    <td className={stat.esiti.perfetta > 0 ? 'cella-perfetta' : ''}>
                      {formatPercentuale(stat.esiti.perfetta)}
                    </td>
                    <td className={stat.esiti.positiva > 0 ? 'cella-positiva' : ''}>
                      {formatPercentuale(stat.esiti.positiva)}
                    </td>
                    <td className={stat.esiti.esclamativa > 0 ? 'cella-esclamativa' : ''}>
                      {formatPercentuale(stat.esiti.esclamativa)}
                    </td>
                    <td className={stat.esiti.negativa > 0 ? 'cella-negativa' : ''}>
                      {formatPercentuale(stat.esiti.negativa)}
                    </td>
                    <td className={stat.esiti.slash > 0 ? 'cella-slash' : ''}>
                      {formatPercentuale(stat.esiti.slash)}
                    </td>
                    <td className={stat.esiti.errore >= 15 ? 'cella-errore-critico' : stat.esiti.errore > 0 ? 'cella-errore' : ''}>
                      {formatPercentuale(stat.esiti.errore)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
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
