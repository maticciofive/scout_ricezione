import React, { useState, useEffect } from 'react';

interface Player {
  id: number;
  name: string;
  zone: number;
}

interface Reception {
  id: number;
  playerIndex: number;
  playerName: string;
  zone: number;
  side: string;
  direction: string;
  outcome: string;
  timestamp: string;
}

const ALL_ZONES = [4, 3, 2, 7, 8, 9, 5, 6, 1];
const ZONE_GRID = [[4, 3, 2], [7, 8, 9], [5, 6, 1]];

const DIRECTIONS = [
  { key: 'up', symbol: '▲', label: 'Davanti al corpo' },
  { key: 'left', symbol: '◀', label: 'A sinistra del corpo' },
  { key: 'center', symbol: '●', label: 'Al corpo' },
  { key: 'right', symbol: '▶', label: 'A destra del corpo' },
  { key: 'down', symbol: '▼', label: 'Dietro al corpo' },
];

const OUTCOMES = [
  { key: '#', label: 'Perfetta', bg: '#22c55e', fg: '#fff' },
  { key: '+', label: 'Buona', bg: '#86efac', fg: '#000' },
  { key: '!', label: 'Discreta', bg: '#facc15', fg: '#000' },
  { key: '-', label: 'Debole', bg: '#fb923c', fg: '#fff' },
  { key: '/', label: 'Errore', bg: '#ef4444', fg: '#fff' },
  { key: '=', label: 'Annullata', bg: '#9ca3af', fg: '#fff' },
];

const SIDES: Record<string, number[]> = {
  Sinistra: [4, 7, 5],
  Centro: [3, 8, 6],
  Destra: [2, 9, 1],
};

function getSideForZone(zone: number): string {
  for (const [side, zones] of Object.entries(SIDES)) {
    if (zones.includes(zone)) return side;
  }
  return 'Centro';
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: 'Giocatore 1', zone: 5 },
  { id: 2, name: 'Giocatore 2', zone: 6 },
  { id: 3, name: 'Giocatore 3', zone: 1 },
];

export default function App() {
  const [players, setPlayers] = useState<Player[]>(() => loadJSON<Player[]>('vb_players', DEFAULT_PLAYERS));
  const [receptions, setReceptions] = useState<Reception[]>(() => loadJSON<Reception[]>('vb_receptions', []));
  const [playerCount, setPlayerCount] = useState<number>(() => loadJSON<number>('vb_count', 3));
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState<number | null>(null);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showConfig, setShowConfig] = useState(false);
  const [tempCount, setTempCount] = useState(playerCount);

  useEffect(() => { saveJSON('vb_players', players); }, [players]);
  useEffect(() => { saveJSON('vb_receptions', receptions); }, [receptions]);
  useEffect(() => { saveJSON('vb_count', playerCount); }, [playerCount]);

  const applyCount = () => {
    const c = Math.max(2, Math.min(6, tempCount));
    setPlayerCount(c);
    const updated: Player[] = [];
    for (let i = 0; i < c; i++) {
      if (i < players.length) {
        updated.push(players[i]);
      } else {
        updated.push({ id: i + 1, name: `Giocatore ${i + 1}`, zone: ALL_ZONES[i % 9] });
      }
    }
    setPlayers(updated);
  };

  const updateName = (idx: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, name } : p));
  };

  const updateZone = (idx: number, zone: number) => {
    setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, zone } : p));
  };

  const selectPlayer = (idx: number) => {
    setSelectedPlayerIdx(idx);
    setSelectedDir(null);
    setStep(2);
  };

  const selectDirection = (dir: string) => {
    setSelectedDir(dir);
    setStep(3);
  };

  const selectOutcome = (outcome: string) => {
    if (selectedPlayerIdx === null || selectedDir === null) return;
    const player = players[selectedPlayerIdx];
    const rec: Reception = {
      id: Date.now(),
      playerIndex: selectedPlayerIdx,
      playerName: player.name,
      zone: player.zone,
      side: getSideForZone(player.zone),
      direction: selectedDir,
      outcome,
      timestamp: new Date().toLocaleString('it-IT'),
    };
    setReceptions(prev => [...prev, rec]);
    setSelectedPlayerIdx(null);
    setSelectedDir(null);
    setStep(1);
  };

  const undoLast = () => {
    setReceptions(prev => prev.slice(0, -1));
  };

  const resetAll = () => {
    if (!window.confirm('Sei sicuro di voler cancellare tutti i dati?')) return;
    setPlayers(DEFAULT_PLAYERS);
    setPlayerCount(3);
    setTempCount(3);
    setReceptions([]);
    setSelectedPlayerIdx(null);
    setSelectedDir(null);
    setStep(1);
    localStorage.removeItem('vb_players');
    localStorage.removeItem('vb_receptions');
    localStorage.removeItem('vb_count');
  };

  const exportCSV = () => {
    const dirMap: Record<string, string> = {};
    DIRECTIONS.forEach(d => { dirMap[d.key] = d.label; });
    const headers = ['Giocatore', 'Zona', 'Lato', 'Punto di ricezione', 'Esito', 'Data e ora'];
    const rows = receptions.map(r =>
      [r.playerName, r.zone, r.side, dirMap[r.direction] || r.direction, r.outcome, r.timestamp].join(';')
    );
    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricezioni_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pct = (n: number, t: number) => t === 0 ? '–' : `${Math.round((n / t) * 100)}%`;

  const getOutcomeStats = (filter: (r: Reception) => boolean) => {
    const filtered = receptions.filter(filter);
    const total = filtered.length;
    const counts: Record<string, number> = {};
    OUTCOMES.forEach(o => { counts[o.key] = 0; });
    filtered.forEach(r => { counts[r.outcome] = (counts[r.outcome] || 0) + 1; });
    return { total, counts };
  };

  const getDirectionStats = (playerIdx: number | null, side: string) => {
    const sideZones = SIDES[side];
    const filtered = receptions.filter(r => {
      const matchPlayer = playerIdx === null || r.playerIndex === playerIdx;
      const matchSide = sideZones.includes(r.zone);
      return matchPlayer && matchSide;
    });
    const total = filtered.length;
    const counts: Record<string, number> = {};
    DIRECTIONS.forEach(d => { counts[d.key] = 0; });
    filtered.forEach(r => { counts[r.direction] = (counts[r.direction] || 0) + 1; });
    return { total, counts };
  };

  const guideMsg = step === 1
    ? '👆 Tocca un giocatore sul campo'
    : step === 2
      ? '🎯 Scegli dove ha colpito la palla rispetto al corpo'
      : '✅ Scegli l\'esito della ricezione';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <header className="header">
        <h1>🏐 Scouting Ricezione</h1>
        <p>Analisi della ricezione nella pallavolo</p>
      </header>

      <div className="container">
        <section className="card">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="config-toggle"
          >
            <span>⚙️ Configurazione Giocatori</span>
            <span className="config-toggle-icon">{showConfig ? '−' : '+'}</span>
          </button>

          {showConfig && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <label style={{ fontWeight: 500 }}>Numero giocatori:</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={tempCount}
                  onChange={e => setTempCount(parseInt(e.target.value) || 2)}
                  style={{ width: '60px', padding: '8px', border: '2px solid #d1d5db', borderRadius: '8px', textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}
                />
                <button onClick={applyCount} className="btn" style={{ background: '#2563eb' }}>Applica</button>
              </div>

              {players.map((p, idx) => (
                <div key={idx} className="player-config-item">
                  <span className="player-config-number">{idx + 1}.</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={e => updateName(idx, e.target.value)}
                    className="player-config-input"
                  />
                  <label className="player-config-label">Zona:</label>
                  <select
                    value={p.zone}
                    onChange={e => updateZone(idx, parseInt(e.target.value))}
                    className="player-config-select"
                  >
                    {ALL_ZONES.map(z => <option key={z} value={z}>Zona {z}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Campo da Gioco</h2>
          <div className="court-container">
            <div className="court-net" />
            <div className="court-field">
              <div className="court-grid">
                {ZONE_GRID.flat().map(zone => {
                  const pIdx = players.findIndex(p => p.zone === zone);
                  const player = pIdx >= 0 ? players[pIdx] : null;
                  const isSelected = pIdx === selectedPlayerIdx;
                  const isZone6 = zone === 6;

                  return (
                    <div
                      key={zone}
                      className="zone-cell"
                      style={{
                        transform: isZone6 ? 'translateY(-6px)' : undefined,
                        zIndex: isZone6 ? 10 : 1,
                      }}
                    >
                      <span className="zone-label">{zone}</span>
                      {player ? (
                        <button
                          onClick={() => selectPlayer(pIdx)}
                          className={`player-marker ${isSelected ? 'selected' : ''}`}
                        >
                          <span className="player-marker-name">{player.name}</span>
                          <span className="player-marker-zone">Z.{zone}</span>
                        </button>
                      ) : (
                        <div className="empty-zone">
                          <span className="empty-zone-text">Z.{zone}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="guide-message">{guideMsg}</p>
        </section>

        {step === 2 && (
          <section className="card">
            <h3 className="section-title">Dove ha colpito la palla?</h3>
            <div className="direction-grid">
              <div />
              <button
                onClick={() => selectDirection('up')}
                className={`direction-btn ${selectedDir === 'up' ? 'selected' : ''}`}
                title="Davanti al corpo"
              >
                <span className="direction-btn-symbol">▲</span>
                <span className="direction-btn-label">Davanti</span>
              </button>
              <div />
              <button
                onClick={() => selectDirection('left')}
                className={`direction-btn ${selectedDir === 'left' ? 'selected' : ''}`}
                title="A sinistra del corpo"
              >
                <span className="direction-btn-symbol">◀</span>
                <span className="direction-btn-label">Sinistra</span>
              </button>
              <button
                onClick={() => selectDirection('center')}
                className={`direction-btn ${selectedDir === 'center' ? 'selected' : ''}`}
                title="Al corpo"
              >
                <span className="direction-btn-symbol">●</span>
                <span className="direction-btn-label">Al corpo</span>
              </button>
              <button
                onClick={() => selectDirection('right')}
                className={`direction-btn ${selectedDir === 'right' ? 'selected' : ''}`}
                title="A destra del corpo"
              >
                <span className="direction-btn-symbol">▶</span>
                <span className="direction-btn-label">Destra</span>
              </button>
              <div />
              <button
                onClick={() => selectDirection('down')}
                className={`direction-btn ${selectedDir === 'down' ? 'selected' : ''}`}
                title="Dietro al corpo"
              >
                <span className="direction-btn-symbol">▼</span>
                <span className="direction-btn-label">Dietro</span>
              </button>
              <div />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="card">
            <h3 className="section-title">Esito della ricezione</h3>
            <div className="outcome-grid">
              {OUTCOMES.map(o => (
                <button
                  key={o.key}
                  onClick={() => selectOutcome(o.key)}
                  className="outcome-btn"
                  style={{ background: o.bg, color: o.fg }}
                >
                  {o.key}
                  <span className="outcome-btn-label">{o.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="card">
          <h2 className="section-title-left">Comandi</h2>
          <div className="commands-grid">
            <button
              onClick={undoLast}
              disabled={receptions.length === 0}
              className="btn"
              style={{ background: '#eab308' }}
            >
              ↩️ Annulla ultimo
            </button>
            <button onClick={resetAll} className="btn" style={{ background: '#dc2626' }}>
              🗑️ Azzera dati
            </button>
            <button
              onClick={exportCSV}
              disabled={receptions.length === 0}
              className="btn"
              style={{ background: '#16a34a' }}
            >
              📊 Esporta CSV
            </button>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
            Ricezioni registrate: <strong>{receptions.length}</strong>
          </p>
        </section>

        <section className="card">
          <h2 className="section-title-left">Statistiche per Esito</h2>
          <div className="table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Giocatore</th>
                  <th>Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key}>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: o.bg,
                        color: o.fg,
                        lineHeight: '24px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {o.key}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => {
                  const { total, counts } = getOutcomeStats(r => r.playerIndex === idx);
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td>{p.name}</td>
                      <td style={{ fontWeight: 700, textAlign: 'center' }}>{total}</td>
                      {OUTCOMES.map(o => (
                        <td key={o.key} style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td>SQUADRA</td>
                  <td style={{ textAlign: 'center' }}>{receptions.length}</td>
                  {OUTCOMES.map(o => {
                    const c = receptions.filter(r => r.outcome === o.key).length;
                    return (
                      <td key={o.key} style={{ textAlign: 'center' }}>
                        <div>{c}</div>
                        <div style={{ fontSize: '10px', color: '#374151' }}>{pct(c, receptions.length)}</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title-left">Punto di Ricezione per Lato</h2>
          <div className="table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Giocatore</th>
                  <th style={{ textAlign: 'center' }} colSpan={5}>Sinistra (4-7-5)</th>
                  <th style={{ textAlign: 'center' }} colSpan={5}>Centro (3-8-6)</th>
                  <th style={{ textAlign: 'center' }} colSpan={5}>Destra (2-9-1)</th>
                </tr>
                <tr>
                  {['S', 'C', 'D'].map(s =>
                    DIRECTIONS.map(d => (
                      <th key={`${s}-${d.key}`} style={{ fontSize: '14px', padding: '4px' }} title={d.label}>
                        {d.symbol}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td>{p.name}</td>
                    {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                      const { total, counts } = getDirectionStats(idx, side);
                      return DIRECTIONS.map(d => (
                        <td key={`${side}-${d.key}`} style={{ textAlign: 'center', fontSize: '11px' }}>
                          <div style={{ fontWeight: 700 }}>{counts[d.key]}</div>
                          <div style={{ fontSize: '9px', color: '#6b7280' }}>{pct(counts[d.key], total)}</div>
                        </td>
                      ));
                    })}
                  </tr>
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td>SQUADRA</td>
                  {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                    const { total, counts } = getDirectionStats(null, side);
                    return DIRECTIONS.map(d => (
                      <td key={`${side}-${d.key}`} style={{ textAlign: 'center', fontSize: '11px' }}>
                        <div>{counts[d.key]}</div>
                        <div style={{ fontSize: '9px', color: '#374151' }}>{pct(counts[d.key], total)}</div>
                      </td>
                    ));
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
