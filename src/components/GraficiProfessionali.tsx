import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';
import './GraficiProfessionali.css';

interface Reception {
  playerIndex: number;
  playerName: string;
  zone: number;
  side: string;
  outcome: string;
  fundamental: string;
  serveType: string;
  serveZone: number;
  direction: string;
  speed: number | null;
  timestamp: string;
}

interface Player {
  id: number;
  name: string;
  zone: number;
}

interface GraficiProfessionaliProps {
  players: Player[];
  receptions: Reception[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function GraficiProfessionali({ players, receptions }: GraficiProfessionaliProps) {
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [graficoAttivo, setGraficoAttivo] = useState<string>('distribuzione-esiti');

  const filteredReceptions = useMemo(() => {
    if (playerFilter === 'all') return receptions;
    return receptions.filter(r => r.playerIndex === parseInt(playerFilter));
  }, [receptions, playerFilter]);

  // 1. Distribuzione Esiti (Pie Chart)
  const distribuzioneEsiti = useMemo(() => {
    const esiti = ['#', '+', '!', '-', '/', '='];
    const labels: Record<string, string> = {
      '#': 'Perfetta',
      '+': 'Positiva',
      '!': 'Esclamativa',
      '-': 'Negativa',
      '/': 'Slash',
      '=': 'Errore',
    };
    return esiti.map(esito => ({
      name: labels[esito],
      value: filteredReceptions.filter(r => r.outcome === esito).length,
      percentage: filteredReceptions.length > 0
        ? (filteredReceptions.filter(r => r.outcome === esito).length / filteredReceptions.length) * 100
        : 0,
    }));
  }, [filteredReceptions]);

  // 2. Performance per Lato (Bar Chart)
  const performancePerLato = useMemo(() => {
    const lati = ['Sinistra', 'Centro', 'Destra'];
    return lati.map(lato => {
      const ricezioniLato = filteredReceptions.filter(r => r.side === lato);
      const positive = ricezioniLato.filter(r => r.outcome === '#' || r.outcome === '+').length;
      const errors = ricezioniLato.filter(r => r.outcome === '=').length;
      return {
        lato,
        totale: ricezioniLato.length,
        pp: ricezioniLato.length > 0 ? (positive / ricezioniLato.length) * 100 : 0,
        er: ricezioniLato.length > 0 ? ((positive - errors) / ricezioniLato.length) * 100 : 0,
        pe: ricezioniLato.length > 0 ? (errors / ricezioniLato.length) * 100 : 0,
      };
    });
  }, [filteredReceptions]);

  // 3. Performance per Fondamentale (Bar Chart)
  const performancePerFondamentale = useMemo(() => {
    const fondamentali = [
      { key: 'B', label: 'Bagher' },
      { key: 'P', label: 'Palleggio' },
    ];
    return fondamentali.map(fund => {
      const ricezioniFund = filteredReceptions.filter(r => r.fundamental === fund.key);
      const positive = ricezioniFund.filter(r => r.outcome === '#' || r.outcome === '+').length;
      const errors = ricezioniFund.filter(r => r.outcome === '=').length;
      return {
        fondamentale: fund.label,
        totale: ricezioniFund.length,
        pp: ricezioniFund.length > 0 ? (positive / ricezioniFund.length) * 100 : 0,
        er: ricezioniFund.length > 0 ? ((positive - errors) / ricezioniFund.length) * 100 : 0,
      };
    });
  }, [filteredReceptions]);

  // 4. Distribuzione Zone di Provenienza (Pie Chart)
  const distribuzioneZoneProvenienza = useMemo(() => {
    const zone = [1, 5, 6];
    return zone.map(zona => ({
      name: `Zona ${zona}`,
      value: filteredReceptions.filter(r => r.serveZone === zona).length,
    }));
  }, [filteredReceptions]);

  // 5. Performance per Tipo di Battuta (Bar Chart)
  const performancePerTipoBattuta = useMemo(() => {
    const tipi = [
      { key: 'F', label: 'Float' },
      { key: 'SF', label: 'Salto Float' },
      { key: 'SS', label: 'Salto Spin' },
      { key: 'SP', label: 'Splot' },
      { key: 'FL', label: 'Flin' },
    ];
    return tipi.map(tipo => {
      const ricezioniTipo = filteredReceptions.filter(r => r.serveType === tipo.key);
      const positive = ricezioniTipo.filter(r => r.outcome === '#' || r.outcome === '+').length;
      const errors = ricezioniTipo.filter(r => r.outcome === '=').length;
      return {
        tipo: tipo.label,
        totale: ricezioniTipo.length,
        pp: ricezioniTipo.length > 0 ? (positive / ricezioniTipo.length) * 100 : 0,
        er: ricezioniTipo.length > 0 ? ((positive - errors) / ricezioniTipo.length) * 100 : 0,
      };
    }).filter(t => t.totale > 0);
  }, [filteredReceptions]);

  // 6. Radar Chart - Performance Multidimensionale
  const radarData = useMemo(() => {
    const lati = ['Sinistra', 'Centro', 'Destra'];
    return lati.map(lato => {
      const ricezioniLato = filteredReceptions.filter(r => r.side === lato);
      const positive = ricezioniLato.filter(r => r.outcome === '#' || r.outcome === '+').length;
      const errors = ricezioniLato.filter(r => r.outcome === '=').length;
      return {
        lato,
        PP: ricezioniLato.length > 0 ? (positive / ricezioniLato.length) * 100 : 0,
        ER: ricezioniLato.length > 0 ? ((positive - errors) / ricezioniLato.length) * 100 : 0,
        Totale: ricezioniLato.length,
      };
    });
  }, [filteredReceptions]);

  // 7. Scatter Plot - Velocità vs Performance (solo se ci sono dati sulla velocità)
  const scatterVelocita = useMemo(() => {
    const ricezioniConVelocita = filteredReceptions.filter(r => r.speed !== null && r.speed !== undefined);
    if (ricezioniConVelocita.length === 0) return [];
    
    return ricezioniConVelocita.map(r => ({
      velocita: r.speed as number,
      esito: r.outcome === '#' || r.outcome === '+' ? 1 : r.outcome === '=' ? -1 : 0,
      label: `${r.speed} km/h - ${r.outcome}`,
    }));
  }, [filteredReceptions]);

  // 8. Area Chart - Trend Temporale (se ci sono timestamp)
  const trendTemporale = useMemo(() => {
    const sortedReceptions = [...filteredReceptions].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Raggruppa per giorno
    const perGiorno: Record<string, { positive: number; total: number }> = {};
    sortedReceptions.forEach(r => {
      const giorno = new Date(r.timestamp).toLocaleDateString('it-IT');
      if (!perGiorno[giorno]) perGiorno[giorno] = { positive: 0, total: 0 };
      perGiorno[giorno].total++;
      if (r.outcome === '#' || r.outcome === '+') perGiorno[giorno].positive++;
    });
    
    return Object.entries(perGiorno).map(([giorno, data]) => ({
      giorno,
      PP: (data.positive / data.total) * 100,
      totale: data.total,
    }));
  }, [filteredReceptions]);

  // 9. Confronto Giocatori (se selezionato "all")
  const confrontoGiocatori = useMemo(() => {
    if (playerFilter !== 'all') return [];
    
    return players.map((player, idx) => {
      const playerReceptions = receptions.filter(r => r.playerIndex === idx);
      const positive = playerReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
      const errors = playerReceptions.filter(r => r.outcome === '=').length;
      return {
        nome: player.name,
        totale: playerReceptions.length,
        pp: playerReceptions.length > 0 ? (positive / playerReceptions.length) * 100 : 0,
        er: playerReceptions.length > 0 ? ((positive - errors) / playerReceptions.length) * 100 : 0,
      };
    }).filter(p => p.totale > 0);
  }, [playerFilter, players, receptions]);

  const renderGrafico = () => {
    switch (graficoAttivo) {
      case 'distribuzione-esiti':
        return (
          <div className="grafico-container">
            <h3>📊 Distribuzione Esiti</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={distribuzioneEsiti}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuzioneEsiti.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance-lato':
        return (
          <div className="grafico-container">
            <h3>📍 Performance per Lato</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performancePerLato}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lato" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pp" fill="#3b82f6" name="PP (%)" />
                <Bar dataKey="er" fill="#10b981" name="ER (%)" />
                <Bar dataKey="pe" fill="#ef4444" name="PE (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance-fondamentale':
        return (
          <div className="grafico-container">
            <h3>🤲 Performance per Fondamentale</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performancePerFondamentale}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fondamentale" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pp" fill="#3b82f6" name="PP (%)" />
                <Bar dataKey="er" fill="#10b981" name="ER (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'distribuzione-zone':
        return (
          <div className="grafico-container">
            <h3>📍 Distribuzione Zone di Provenienza</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={distribuzioneZoneProvenienza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuzioneZoneProvenienza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance-tipo-battuta':
        return (
          <div className="grafico-container">
            <h3>🏐 Performance per Tipo di Battuta</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performancePerTipoBattuta}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pp" fill="#3b82f6" name="PP (%)" />
                <Bar dataKey="er" fill="#10b981" name="ER (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'radar-performance':
        return (
          <div className="grafico-container">
            <h3>🎯 Radar Performance Multidimensionale</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="lato" />
                <PolarRadiusAxis />
                <Radar name="PP" dataKey="PP" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="ER" dataKey="ER" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'scatter-velocita':
        return scatterVelocita.length > 0 ? (
          <div className="grafico-container">
            <h3>⚡ Velocità vs Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="velocita" name="Velocità" unit=" km/h" />
                <YAxis type="number" dataKey="esito" name="Esito" domain={[-1, 1]} />
                <ZAxis type="number" range={[100, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Ricezioni" data={scatterVelocita} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grafico-container">
            <h3>⚡ Velocità vs Performance</h3>
            <p className="grafico-empty">Nessun dato sulla velocità disponibile</p>
          </div>
        );

      case 'trend-temporale':
        return trendTemporale.length > 0 ? (
          <div className="grafico-container">
            <h3>📈 Trend Temporale PP</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendTemporale}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="giorno" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="PP" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="PP (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grafico-container">
            <h3>📈 Trend Temporale PP</h3>
            <p className="grafico-empty">Dati temporali insufficienti</p>
          </div>
        );

      case 'confronto-giocatori':
        return playerFilter === 'all' && confrontoGiocatori.length > 0 ? (
          <div className="grafico-container">
            <h3>👥 Confronto Giocatori</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={confrontoGiocatori}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pp" fill="#3b82f6" name="PP (%)" />
                <Bar dataKey="er" fill="#10b981" name="ER (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grafico-container">
            <h3>👥 Confronto Giocatori</h3>
            <p className="grafico-empty">Seleziona "Tutti i giocatori" per vedere il confronto</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grafici-professionali-container">
      <h2 className="grafici-professionali-title">📊 Grafici Professionali</h2>

      {/* Controlli */}
      <div className="grafici-controls">
        <div className="grafici-control-group">
          <label>Giocatore:</label>
          <select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)}>
            <option value="all">Tutti i giocatori</option>
            {players.map((p, idx) => (
              <option key={idx} value={idx}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grafici-control-group">
          <label>Tipo di Grafico:</label>
          <select value={graficoAttivo} onChange={(e) => setGraficoAttivo(e.target.value)}>
            <option value="distribuzione-esiti">📊 Distribuzione Esiti</option>
            <option value="performance-lato">📍 Performance per Lato</option>
            <option value="performance-fondamentale">🤲 Performance per Fondamentale</option>
            <option value="distribuzione-zone">📍 Distribuzione Zone di Provenienza</option>
            <option value="performance-tipo-battuta">🏐 Performance per Tipo di Battuta</option>
            <option value="radar-performance">🎯 Radar Performance Multidimensionale</option>
            <option value="scatter-velocita">⚡ Velocità vs Performance</option>
            <option value="trend-temporale">📈 Trend Temporale PP</option>
            <option value="confronto-giocatori">👥 Confronto Giocatori</option>
          </select>
        </div>
      </div>

      {/* Grafico */}
      {renderGrafico()}

      {/* Statistiche riepilogative */}
      <div className="grafici-summary">
        <h4>📋 Statistiche Riepilogative</h4>
        <div className="grafici-summary-grid">
          <div className="summary-item">
            <span className="summary-label">Totale Ricezioni:</span>
            <span className="summary-value">{filteredReceptions.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">PP Media:</span>
            <span className="summary-value">
              {filteredReceptions.length > 0
                ? ((filteredReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length / filteredReceptions.length) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">ER Media:</span>
            <span className="summary-value">
              {filteredReceptions.length > 0
                ? (((filteredReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length - filteredReceptions.filter(r => r.outcome === '=').length) / filteredReceptions.length) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Ricezioni con Velocità:</span>
            <span className="summary-value">
              {filteredReceptions.filter(r => r.speed !== null && r.speed !== undefined).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
