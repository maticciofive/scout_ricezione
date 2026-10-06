import React, { useState, useMemo } from 'react';
import './ConfrontoGiocatori.css';

interface Reception {
  playerIndex: number;
  zone: number;
  side: string;
  outcome: string;
  fundamental: string;
  serveType: string;
  serveZone: number;
  direction: string;
}

interface Player {
  id: number;
  name: string;
  zone: number;
}

interface ConfrontoGiocatoriProps {
  players: Player[];
  receptions: Reception[];
}

interface StatisticheGiocatore {
  nome: string;
  totale: number;
  pp: number;
  er: number;
  pe: number;
  pn: number;
  perfette: number;
  positive: number;
  esclamative: number;
  negative: number;
  slash: number;
  errori: number;
  perZona: Record<string, number>;
  perLato: Record<string, { totale: number; pp: number; er: number }>;
  perServeZone: Record<number, { totale: number; pp: number; er: number }>;
  perServeType: Record<string, { totale: number; pp: number; er: number }>;
}

export default function ConfrontoGiocatori({ players, receptions }: ConfrontoGiocatoriProps) {
  const [giocatoriSelezionati, setGiocatoriSelezionati] = useState<number[]>([]);

  // Calcola le statistiche per ogni giocatore
  const calcolaStatistiche = (playerIndex: number): StatisticheGiocatore => {
    const playerReceptions = receptions.filter(r => r.playerIndex === playerIndex);
    const totale = playerReceptions.length;
    
    if (totale === 0) {
      return {
        nome: players[playerIndex]?.name || 'Sconosciuto',
        totale: 0,
        pp: 0,
        er: 0,
        pe: 0,
        pn: 0,
        perfette: 0,
        positive: 0,
        esclamative: 0,
        negative: 0,
        slash: 0,
        errori: 0,
        perZona: {},
        perLato: {},
        perServeZone: {},
        perServeType: {},
      };
    }

    const perfette = playerReceptions.filter(r => r.outcome === '#').length;
    const positive = playerReceptions.filter(r => r.outcome === '+').length;
    const esclamative = playerReceptions.filter(r => r.outcome === '!').length;
    const negative = playerReceptions.filter(r => r.outcome === '-').length;
    const slash = playerReceptions.filter(r => r.outcome === '/').length;
    const errori = playerReceptions.filter(r => r.outcome === '=').length;

    const pp = ((perfette + positive) / totale) * 100;
    const er = ((perfette + positive - errori) / totale) * 100;
    const pe = (errori / totale) * 100;
    const pn = ((negative + slash) / totale) * 100;

    // Statistiche per zona
    const perZona: Record<string, number> = {};
    playerReceptions.forEach(r => {
      const zona = `Zona ${r.zone}`;
      perZona[zona] = (perZona[zona] || 0) + 1;
    });

    // Statistiche per lato
    const perLato: Record<string, { totale: number; positive: number; errors: number }> = {
      'Sinistra': { totale: 0, positive: 0, errors: 0 },
      'Centro': { totale: 0, positive: 0, errors: 0 },
      'Destra': { totale: 0, positive: 0, errors: 0 },
    };

    playerReceptions.forEach(r => {
      if (perLato[r.side]) {
        perLato[r.side].totale++;
        if (r.outcome === '#' || r.outcome === '+') perLato[r.side].positive++;
        if (r.outcome === '=') perLato[r.side].errors++;
      }
    });

    const perLatoCalcolato: Record<string, { totale: number; pp: number; er: number }> = {};
    Object.entries(perLato).forEach(([lato, stats]) => {
      perLatoCalcolato[lato] = {
        totale: stats.totale,
        pp: stats.totale > 0 ? (stats.positive / stats.totale) * 100 : 0,
        er: stats.totale > 0 ? ((stats.positive - stats.errors) / stats.totale) * 100 : 0,
      };
    });

    // Statistiche per zona di provenienza battuta
    const perServeZone: Record<number, { totale: number; positive: number; errors: number }> = {
      1: { totale: 0, positive: 0, errors: 0 },
      5: { totale: 0, positive: 0, errors: 0 },
      6: { totale: 0, positive: 0, errors: 0 },
    };

    playerReceptions.forEach(r => {
      if (perServeZone[r.serveZone]) {
        perServeZone[r.serveZone].totale++;
        if (r.outcome === '#' || r.outcome === '+') perServeZone[r.serveZone].positive++;
        if (r.outcome === '=') perServeZone[r.serveZone].errors++;
      }
    });

    const perServeZoneCalcolato: Record<number, { totale: number; pp: number; er: number }> = {};
    Object.entries(perServeZone).forEach(([zone, stats]) => {
      perServeZoneCalcolato[parseInt(zone)] = {
        totale: stats.totale,
        pp: stats.totale > 0 ? (stats.positive / stats.totale) * 100 : 0,
        er: stats.totale > 0 ? ((stats.positive - stats.errors) / stats.totale) * 100 : 0,
      };
    });

    // Statistiche per tipo di battuta
    const perServeType: Record<string, { totale: number; positive: number; errors: number }> = {};
    playerReceptions.forEach(r => {
      if (!perServeType[r.serveType]) {
        perServeType[r.serveType] = { totale: 0, positive: 0, errors: 0 };
      }
      perServeType[r.serveType].totale++;
      if (r.outcome === '#' || r.outcome === '+') perServeType[r.serveType].positive++;
      if (r.outcome === '=') perServeType[r.serveType].errors++;
    });

    const perServeTypeCalcolato: Record<string, { totale: number; pp: number; er: number }> = {};
    Object.entries(perServeType).forEach(([type, stats]) => {
      perServeTypeCalcolato[type] = {
        totale: stats.totale,
        pp: stats.totale > 0 ? (stats.positive / stats.totale) * 100 : 0,
        er: stats.totale > 0 ? ((stats.positive - stats.errors) / stats.totale) * 100 : 0,
      };
    });

    return {
      nome: players[playerIndex]?.name || 'Sconosciuto',
      totale,
      pp,
      er,
      pe,
      pn,
      perfette,
      positive,
      esclamative,
      negative,
      slash,
      errori,
      perZona,
      perLato: perLatoCalcolato,
      perServeZone: perServeZoneCalcolato,
      perServeType: perServeTypeCalcolato,
    };
  };

  // Calcola le statistiche per i giocatori selezionati
  const statisticheGiocatori = useMemo(() => {
    return giocatoriSelezionati.map(idx => calcolaStatistiche(idx));
  }, [giocatoriSelezionati, receptions]);

  // Toggle selezione giocatore
  const toggleGiocatore = (idx: number) => {
    setGiocatoriSelezionati(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else if (prev.length < 3) {
        return [...prev, idx];
      }
      return prev;
    });
  };

  // Trova il migliore per ogni metrica
  const trovaMigliore = (metrica: keyof StatisticheGiocatore): number => {
    if (statisticheGiocatori.length === 0) return -1;
    
    let maxIdx = 0;
    let maxVal = -Infinity;
    
    statisticheGiocatori.forEach((stat, idx) => {
      const val = stat[metrica] as number;
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });
    
    return maxIdx;
  };

  // Trova il peggiore per ogni metrica
  const trovaPeggiore = (metrica: keyof StatisticheGiocatore): number => {
    if (statisticheGiocatori.length === 0) return -1;
    
    let minIdx = 0;
    let minVal = Infinity;
    
    statisticheGiocatori.forEach((stat, idx) => {
      const val = stat[metrica] as number;
      if (val < minVal) {
        minVal = val;
        minIdx = idx;
      }
    });
    
    return minIdx;
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="confronto-container">
      <h2 className="confronto-title">👥 Confronto Giocatori</h2>
      
      {/* Selezione giocatori */}
      <div className="confronto-selezione">
        <h3>Seleziona fino a 3 giocatori da confrontare:</h3>
        <div className="confronto-giocatori-list">
          {players.map((player, idx) => (
            <button
              key={idx}
              className={`confronto-giocatore-btn ${giocatoriSelezionati.includes(idx) ? 'selected' : ''}`}
              style={{
                borderColor: giocatoriSelezionati.includes(idx) ? colors[giocatoriSelezionati.indexOf(idx)] : undefined,
                backgroundColor: giocatoriSelezionati.includes(idx) ? `${colors[giocatoriSelezionati.indexOf(idx)]}20` : undefined,
              }}
              onClick={() => toggleGiocatore(idx)}
              disabled={!giocatoriSelezionati.includes(idx) && giocatoriSelezionati.length >= 3}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      {/* Risultati del confronto */}
      {statisticheGiocatori.length > 0 && (
        <>
          {/* Tabella comparativa */}
          <div className="confronto-tabella-container">
            <h3>📊 Confronto Metriche</h3>
            <table className="confronto-tabella">
              <thead>
                <tr>
                  <th>Metrica</th>
                  {statisticheGiocatori.map((stat, idx) => (
                    <th key={idx} style={{ color: colors[idx] }}>
                      {stat.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Totale Ricezioni</strong></td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx} className={trovaMigliore('totale') === idx ? 'best' : ''}>
                      {stat.totale}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>PP (Percentuale Positiva)</strong></td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx} className={trovaMigliore('pp') === idx ? 'best' : ''}>
                      {stat.pp.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>ER (Efficienza)</strong></td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx} className={trovaMigliore('er') === idx ? 'best' : ''}>
                      {stat.er.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>PE (Percentuale Errori)</strong></td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx} className={trovaPeggiore('pe') === idx ? 'worst' : ''}>
                      {stat.pe.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>PN (Percentuale Negativa)</strong></td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx} className={trovaPeggiore('pn') === idx ? 'worst' : ''}>
                      {stat.pn.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Perfette (#)</td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx}>{stat.perfette} ({((stat.perfette / stat.totale) * 100).toFixed(1)}%)</td>
                  ))}
                </tr>
                <tr>
                  <td>Positive (+)</td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx}>{stat.positive} ({((stat.positive / stat.totale) * 100).toFixed(1)}%)</td>
                  ))}
                </tr>
                <tr>
                  <td>Errori (=)</td>
                  {statisticheGiocatori.map((stat, idx) => (
                    <td key={idx}>{stat.errori} ({((stat.errori / stat.totale) * 100).toFixed(1)}%)</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Confronto per lato */}
          <div className="confronto-lato-container">
            <h3>📍 Confronto per Lato</h3>
            <div className="confronto-lato-grid">
              {['Sinistra', 'Centro', 'Destra'].map(lato => (
                <div key={lato} className="confronto-lato-card">
                  <h4>{lato}</h4>
                  <table className="confronto-lato-tabella">
                    <thead>
                      <tr>
                        <th>Giocatore</th>
                        <th>Totale</th>
                        <th>PP</th>
                        <th>ER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statisticheGiocatori.map((stat, idx) => (
                        <tr key={idx}>
                          <td style={{ color: colors[idx], fontWeight: 600 }}>{stat.nome}</td>
                          <td>{stat.perLato[lato]?.totale || 0}</td>
                          <td>{stat.perLato[lato]?.pp.toFixed(1) || '0.0'}%</td>
                          <td>{stat.perLato[lato]?.er.toFixed(1) || '0.0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Confronto per zona di provenienza battuta */}
          <div className="confronto-lato-container">
            <h3>🏐 Confronto per Zona di Provenienza Battuta</h3>
            <div className="confronto-lato-grid">
              {[1, 5, 6].map(zone => (
                <div key={zone} className="confronto-lato-card">
                  <h4>Zona {zone}</h4>
                  <table className="confronto-lato-tabella">
                    <thead>
                      <tr>
                        <th>Giocatore</th>
                        <th>Totale</th>
                        <th>PP</th>
                        <th>ER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statisticheGiocatori.map((stat, idx) => (
                        <tr key={idx}>
                          <td style={{ color: colors[idx], fontWeight: 600 }}>{stat.nome}</td>
                          <td>{stat.perServeZone[zone]?.totale || 0}</td>
                          <td>{stat.perServeZone[zone]?.pp.toFixed(1) || '0.0'}%</td>
                          <td>{stat.perServeZone[zone]?.er.toFixed(1) || '0.0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Confronto per tipo di battuta */}
          <div className="confronto-lato-container">
            <h3>🎯 Confronto per Tipo di Battuta</h3>
            <div className="confronto-lato-grid">
              {Object.keys(statisticheGiocatori[0]?.perServeType || {}).map(type => {
                const typeLabels: Record<string, string> = {
                  'F': 'Float',
                  'SF': 'Salto Float',
                  'SS': 'Salto Spin',
                  'SP': 'Splot',
                  'FL': 'Flin'
                };
                return (
                  <div key={type} className="confronto-lato-card">
                    <h4>{typeLabels[type] || type}</h4>
                    <table className="confronto-lato-tabella">
                      <thead>
                        <tr>
                          <th>Giocatore</th>
                          <th>Totale</th>
                          <th>PP</th>
                          <th>ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statisticheGiocatori.map((stat, idx) => (
                          <tr key={idx}>
                            <td style={{ color: colors[idx], fontWeight: 600 }}>{stat.nome}</td>
                            <td>{stat.perServeType[type]?.totale || 0}</td>
                            <td>{stat.perServeType[type]?.pp.toFixed(1) || '0.0'}%</td>
                            <td>{stat.perServeType[type]?.er.toFixed(1) || '0.0'}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grafico a barre comparativo */}
          <div className="confronto-grafico-container">
            <h3>📈 Confronto Visivo</h3>
            <div className="confronto-grafico">
              {['pp', 'er', 'pe', 'pn'].map(metrica => (
                <div key={metrica} className="confronto-grafico-item">
                  <div className="confronto-grafico-label">
                    {metrica.toUpperCase()}
                  </div>
                  <div className="confronto-grafico-bars">
                    {statisticheGiocatori.map((stat, idx) => {
                      const value = stat[metrica as keyof StatisticheGiocatore] as number;
                      return (
                        <div key={idx} className="confronto-grafico-bar-wrapper">
                          <div
                            className="confronto-grafico-bar"
                            style={{
                              width: `${Math.max(0, Math.min(100, value))}%`,
                              backgroundColor: colors[idx],
                            }}
                          >
                            <span className="confronto-grafico-bar-value">
                              {value.toFixed(1)}%
                            </span>
                          </div>
                          <span className="confronto-grafico-bar-name">{stat.nome}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analisi comparativa */}
          <div className="confronto-analisi">
            <h3>💡 Analisi Comparativa</h3>
            <div className="confronto-analisi-content">
              {statisticheGiocatori.length > 1 && (
                <>
                  <div className="confronto-analisi-item">
                    <strong>Miglior PP:</strong> {statisticheGiocatori[trovaMigliore('pp')].nome} 
                    ({statisticheGiocatori[trovaMigliore('pp')].pp.toFixed(1)}%)
                  </div>
                  <div className="confronto-analisi-item">
                    <strong>Miglior ER:</strong> {statisticheGiocatori[trovaMigliore('er')].nome} 
                    ({statisticheGiocatori[trovaMigliore('er')].er.toFixed(1)}%)
                  </div>
                  <div className="confronto-analisi-item">
                    <strong>Minor PE:</strong> {statisticheGiocatori[trovaPeggiore('pe')].nome} 
                    ({statisticheGiocatori[trovaPeggiore('pe')].pe.toFixed(1)}%)
                  </div>
                  <div className="confronto-analisi-item">
                    <strong>Più attivo:</strong> {statisticheGiocatori[trovaMigliore('totale')].nome} 
                    ({statisticheGiocatori[trovaMigliore('totale')].totale} ricezioni)
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {giocatoriSelezionati.length === 0 && (
        <div className="confronto-empty">
          <p>Seleziona almeno 2 giocatori per iniziare il confronto</p>
        </div>
      )}
    </div>
  );
}
