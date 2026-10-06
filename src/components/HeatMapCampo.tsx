import React, { useState, useMemo } from 'react';
import './HeatMapCampo.css';

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

interface HeatMapCampoProps {
  players: Player[];
  receptions: Reception[];
}

type MetricaType = 'totale' | 'pp' | 'er' | 'pe' | 'pn';

export default function HeatMapCampo({ players, receptions }: HeatMapCampoProps) {
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [metrica, setMetrica] = useState<MetricaType>('totale');
  const [fundamentalFilter, setFundamentalFilter] = useState<string>('all');
  const [serveZoneFilter, setServeZoneFilter] = useState<string>('all');
  const [serveTypeFilter, setServeTypeFilter] = useState<string>('all');

  // Filtra le ricezioni in base ai filtri selezionati
  const filteredReceptions = useMemo(() => {
    return receptions.filter(r => {
      if (playerFilter !== 'all' && r.playerIndex !== parseInt(playerFilter)) return false;
      if (fundamentalFilter !== 'all' && r.fundamental !== fundamentalFilter) return false;
      if (serveZoneFilter !== 'all' && r.serveZone !== parseInt(serveZoneFilter)) return false;
      if (serveTypeFilter !== 'all' && r.serveType !== serveTypeFilter) return false;
      return true;
    });
  }, [receptions, playerFilter, fundamentalFilter, serveZoneFilter, serveTypeFilter]);

  // Calcola le statistiche per ogni zona
  const zoneStats = useMemo(() => {
    const stats: Record<number, { totale: number; positive: number; errors: number; negative: number }> = {};
    
    // Inizializza tutte le zone
    for (let i = 1; i <= 9; i++) {
      stats[i] = { totale: 0, positive: 0, errors: 0, negative: 0 };
    }

    // Calcola le statistiche
    filteredReceptions.forEach(r => {
      if (!stats[r.zone]) return;
      stats[r.zone].totale++;
      if (r.outcome === '#' || r.outcome === '+') stats[r.zone].positive++;
      if (r.outcome === '=') stats[r.zone].errors++;
      if (r.outcome === '-' || r.outcome === '/') stats[r.zone].negative++;
    });

    return stats;
  }, [filteredReceptions]);

  // Calcola il valore della metrica per ogni zona
  const getMetricaValue = (zone: number): number => {
    const stat = zoneStats[zone];
    if (!stat || stat.totale === 0) return 0;

    switch (metrica) {
      case 'totale':
        return stat.totale;
      case 'pp':
        return (stat.positive / stat.totale) * 100;
      case 'er':
        return ((stat.positive - stat.errors) / stat.totale) * 100;
      case 'pe':
        return (stat.errors / stat.totale) * 100;
      case 'pn':
        return (stat.negative / stat.totale) * 100;
      default:
        return 0;
    }
  };

  // Determina il colore in base al valore della metrica
  const getColor = (value: number, maxValue: number): string => {
    if (maxValue === 0) return '#e5e7eb';
    
    const intensity = value / maxValue;
    
    // Per PE e PN (errori/negativi), rosso è negativo
    if (metrica === 'pe' || metrica === 'pn') {
      if (intensity > 0.7) return '#dc2626'; // Rosso scuro
      if (intensity > 0.4) return '#f59e0b'; // Arancione
      if (intensity > 0) return '#fbbf24'; // Giallo
      return '#e5e7eb'; // Grigio
    }
    
    // Per PP, ER e totale, verde è positivo
    if (intensity > 0.7) return '#16a34a'; // Verde scuro
    if (intensity > 0.4) return '#22c55e'; // Verde
    if (intensity > 0) return '#86efac'; // Verde chiaro
    return '#e5e7eb'; // Grigio
  };

  // Trova il valore massimo per normalizzare i colori
  const maxValue = useMemo(() => {
    return Math.max(...Object.values(zoneStats).map(s => {
      if (s.totale === 0) return 0;
      switch (metrica) {
        case 'totale': return s.totale;
        case 'pp': return (s.positive / s.totale) * 100;
        case 'er': return (s.positive - s.errors) / s.totale * 100;
        case 'pe': return (s.errors / s.totale) * 100;
        case 'pn': return (s.negative / s.totale) * 100;
        default: return 0;
      }
    }));
  }, [zoneStats, metrica]);

  // Layout del campo (zone numerazione pallavolo)
  const fieldLayout = [
    [4, 3, 2],
    [7, 8, 9],
    [5, 6, 1],
  ];

  return (
    <div className="heatmap-container">
      <h2 className="heatmap-title">🗺️ Heat Map del Campo</h2>
      
      {/* Controlli */}
      <div className="heatmap-controls">
        <div className="heatmap-control-group">
          <label>Giocatore:</label>
          <select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)}>
            <option value="all">Tutti i giocatori</option>
            {players.map((p, idx) => (
              <option key={idx} value={idx}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="heatmap-control-group">
          <label>Fondamentale:</label>
          <select value={fundamentalFilter} onChange={(e) => setFundamentalFilter(e.target.value)}>
            <option value="all">Tutti</option>
            <option value="B">Bagher</option>
            <option value="P">Palleggio</option>
          </select>
        </div>

        <div className="heatmap-control-group">
          <label>Zona Provenienza Battuta:</label>
          <select value={serveZoneFilter} onChange={(e) => setServeZoneFilter(e.target.value)}>
            <option value="all">Tutte le zone</option>
            <option value="1">Zona 1</option>
            <option value="5">Zona 5</option>
            <option value="6">Zona 6</option>
          </select>
        </div>

        <div className="heatmap-control-group">
          <label>Tipo Battuta:</label>
          <select value={serveTypeFilter} onChange={(e) => setServeTypeFilter(e.target.value)}>
            <option value="all">Tutti i tipi</option>
            <option value="F">Float</option>
            <option value="SF">Salto Float</option>
            <option value="SS">Salto Spin</option>
            <option value="SP">Splot</option>
            <option value="FL">Flin</option>
          </select>
        </div>

        <div className="heatmap-control-group">
          <label>Metrica:</label>
          <select value={metrica} onChange={(e) => setMetrica(e.target.value as MetricaType)}>
            <option value="totale">Totale Ricezioni</option>
            <option value="pp">PP (Percentuale Positiva)</option>
            <option value="er">ER (Efficienza)</option>
            <option value="pe">PE (Percentuale Errori)</option>
            <option value="pn">PN (Percentuale Negativa)</option>
          </select>
        </div>
      </div>

      {/* Campo da gioco */}
      <div className="heatmap-field">
        <div className="heatmap-net"></div>
        <div className="heatmap-grid">
          {fieldLayout.map((row, rowIdx) => (
            <div key={rowIdx} className="heatmap-row">
              {row.map(zone => {
                const value = getMetricaValue(zone);
                const color = getColor(value, maxValue);
                const stat = zoneStats[zone];
                
                return (
                  <div
                    key={zone}
                    className="heatmap-zone"
                    style={{ backgroundColor: color }}
                  >
                    <div className="heatmap-zone-number">{zone}</div>
                    <div className="heatmap-zone-value">
                      {metrica === 'totale' ? stat.totale : `${value.toFixed(1)}%`}
                    </div>
                    {metrica !== 'totale' && (
                      <div className="heatmap-zone-totale">
                        ({stat.totale} colpi)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Distribuzione battute per zona di provenienza */}
      <div className="heatmap-serve-zone">
        <h4>📍 Distribuzione Battute per Zona di Provenienza</h4>
        <div className="heatmap-serve-zone-grid">
          {[1, 5, 6].map(zone => {
            const zoneReceptions = filteredReceptions.filter(r => r.serveZone === zone);
            const zoneCount = zoneReceptions.length;
            const zonePercentage = filteredReceptions.length > 0 
              ? (zoneCount / filteredReceptions.length) * 100 
              : 0;
            
            // Calcola metriche per questa zona di provenienza
            const positive = zoneReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
            const errors = zoneReceptions.filter(r => r.outcome === '=').length;
            const pp = zoneCount > 0 ? (positive / zoneCount) * 100 : 0;
            const er = zoneCount > 0 ? ((positive - errors) / zoneCount) * 100 : 0;
            
            return (
              <div key={zone} className="heatmap-serve-zone-item">
                <div className="heatmap-serve-zone-header">
                  <span className="heatmap-serve-zone-title">Zona {zone}</span>
                  <span className="heatmap-serve-zone-count">{zoneCount} battute</span>
                </div>
                <div className="heatmap-serve-zone-bar">
                  <div 
                    className="heatmap-serve-zone-bar-fill"
                    style={{ width: `${zonePercentage}%` }}
                  ></div>
                </div>
                <div className="heatmap-serve-zone-percentage">{zonePercentage.toFixed(1)}%</div>
                <div className="heatmap-serve-zone-metrics">
                  <div className="heatmap-serve-zone-metric">
                    <span className="metric-label">PP:</span>
                    <span className="metric-value">{pp.toFixed(1)}%</span>
                  </div>
                  <div className="heatmap-serve-zone-metric">
                    <span className="metric-label">ER:</span>
                    <span className="metric-value">{er.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuzione battute per tipo */}
      <div className="heatmap-serve-type">
        <h4>🏐 Distribuzione Battute per Tipo</h4>
        <div className="heatmap-serve-type-grid">
          {['F', 'SF', 'SS', 'SP', 'FL'].map(type => {
            const typeLabels: Record<string, string> = {
              'F': 'Float',
              'SF': 'Salto Float',
              'SS': 'Salto Spin',
              'SP': 'Splot',
              'FL': 'Flin'
            };
            const typeReceptions = filteredReceptions.filter(r => r.serveType === type);
            const typeCount = typeReceptions.length;
            const typePercentage = filteredReceptions.length > 0 
              ? (typeCount / filteredReceptions.length) * 100 
              : 0;
            
            if (typeCount === 0) return null;
            
            // Calcola metriche per questo tipo di battuta
            const positive = typeReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
            const errors = typeReceptions.filter(r => r.outcome === '=').length;
            const pp = typeCount > 0 ? (positive / typeCount) * 100 : 0;
            const er = typeCount > 0 ? ((positive - errors) / typeCount) * 100 : 0;
            
            return (
              <div key={type} className="heatmap-serve-type-item">
                <div className="heatmap-serve-type-header">
                  <span className="heatmap-serve-type-title">{typeLabels[type]}</span>
                  <span className="heatmap-serve-type-count">{typeCount}</span>
                </div>
                <div className="heatmap-serve-type-bar">
                  <div 
                    className="heatmap-serve-type-bar-fill"
                    style={{ width: `${typePercentage}%` }}
                  ></div>
                </div>
                <div className="heatmap-serve-type-percentage">{typePercentage.toFixed(1)}%</div>
                <div className="heatmap-serve-type-metrics">
                  <span>PP: {pp.toFixed(1)}%</span>
                  <span>ER: {er.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="heatmap-legend">
        <h4>Legenda</h4>
        <div className="heatmap-legend-scale">
          {metrica === 'pe' || metrica === 'pn' ? (
            <>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#e5e7eb' }}></div>
                <span>0%</span>
              </div>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#fbbf24' }}></div>
                <span>Basso</span>
              </div>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Medio</span>
              </div>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#dc2626' }}></div>
                <span>Alto (Critico)</span>
              </div>
            </>
          ) : (
            <>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#e5e7eb' }}></div>
                <span>0%</span>
              </div>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#86efac' }}></div>
                <span>Basso</span>
              </div>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#22c55e' }}></div>
                <span>Medio</span>
              </div>
              <div className="heatmap-legend-item">
                <div className="heatmap-legend-color" style={{ backgroundColor: '#16a34a' }}></div>
                <span>Alto (Ottimo)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Statistiche riepilogative */}
      <div className="heatmap-summary">
        <h4>Riepilogo</h4>
        <div className="heatmap-summary-grid">
          <div className="heatmap-summary-item">
            <span className="heatmap-summary-label">Totale Ricezioni:</span>
            <span className="heatmap-summary-value">{filteredReceptions.length}</span>
          </div>
          <div className="heatmap-summary-item">
            <span className="heatmap-summary-label">Zona più attiva:</span>
            <span className="heatmap-summary-value">
              {Object.entries(zoneStats).reduce((max, [zone, stat]) => 
                stat.totale > max.totale ? { zone, totale: stat.totale } : max
              , { zone: '0', totale: 0 }).zone}
            </span>
          </div>
          <div className="heatmap-summary-item">
            <span className="heatmap-summary-label">Zona più critica:</span>
            <span className="heatmap-summary-value">
              {(() => {
                const zoneWithErrors = Object.entries(zoneStats)
                  .filter(([_, stat]) => stat.totale > 0)
                  .map(([zone, stat]) => ({
                    zone,
                    errorRate: (stat.errors / stat.totale) * 100
                  }))
                  .sort((a, b) => b.errorRate - a.errorRate)[0];
                return zoneWithErrors ? `${zoneWithErrors.zone} (${zoneWithErrors.errorRate.toFixed(1)}%)` : 'N/A';
              })()}
            </span>
          </div>
          <div className="heatmap-summary-item">
            <span className="heatmap-summary-label">Zona provenienza più frequente:</span>
            <span className="heatmap-summary-value">
              {(() => {
                const serveZoneCounts: Record<number, number> = {};
                filteredReceptions.forEach(r => {
                  serveZoneCounts[r.serveZone] = (serveZoneCounts[r.serveZone] || 0) + 1;
                });
                const maxZone = Object.entries(serveZoneCounts).reduce((max, [zone, count]) => 
                  count > max.count ? { zone, count } : max
                , { zone: '0', count: 0 });
                return maxZone.count > 0 ? `Zona ${maxZone.zone} (${maxZone.count})` : 'N/A';
              })()}
            </span>
          </div>
          <div className="heatmap-summary-item">
            <span className="heatmap-summary-label">Tipo battuta più frequente:</span>
            <span className="heatmap-summary-value">
              {(() => {
                const serveTypeCounts: Record<string, number> = {};
                const typeLabels: Record<string, string> = {
                  'F': 'Float',
                  'SF': 'Salto Float',
                  'SS': 'Salto Spin',
                  'SP': 'Splot',
                  'FL': 'Flin'
                };
                filteredReceptions.forEach(r => {
                  serveTypeCounts[r.serveType] = (serveTypeCounts[r.serveType] || 0) + 1;
                });
                const maxType = Object.entries(serveTypeCounts).reduce((max, [type, count]) => 
                  count > max.count ? { type, count } : max
                , { type: '', count: 0 });
                return maxType.count > 0 ? `${typeLabels[maxType.type] || maxType.type} (${maxType.count})` : 'N/A';
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
