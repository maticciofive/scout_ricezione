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
  serveType: string;
  serveZone: number;
  fundamental: string;
  direction: string;
  outcome: string;
  timestamp: string;
}

const ALL_ZONES = [4, 3, 2, 7, 8, 9, 5, 6, 1];
const ZONE_GRID = [[4, 3, 2], [7, 8, 9], [5, 6, 1]];

const SERVE_TYPES = [
  { key: 'F', label: 'Float', emoji: '🎯' },
  { key: 'SF', label: 'Salto Float', emoji: '🏐' },
  { key: 'SS', label: 'Salto Spin', emoji: '💫' },
  { key: 'SP', label: 'Splot', emoji: '⚡' },
  { key: 'FL', label: 'Flin', emoji: '🌀' },
];

const SERVE_ZONES = [
  { zone: 1, label: 'Zona 1' },
  { zone: 5, label: 'Zona 5' },
  { zone: 6, label: 'Zona 6' },
];

const FUNDAMENTALS = [
  { key: 'B', label: 'Bagher', emoji: '🤲' },
  { key: 'P', label: 'Palleggio', emoji: '👐' },
];

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
  const [selectedServeType, setSelectedServeType] = useState<string | null>(null);
  const [selectedServeZone, setSelectedServeZone] = useState<number | null>(null);
  const [selectedFundamental, setSelectedFundamental] = useState<string | null>(null);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
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

  const selectServeZone = (serveZone: number) => {
    setSelectedServeZone(serveZone);
    setStep(2);
  };

  const selectServeType = (serveType: string) => {
    setSelectedServeType(serveType);
    setStep(3);
  };

  const selectPlayer = (idx: number) => {
    setSelectedPlayerIdx(idx);
    setStep(4);
  };

  const selectFundamental = (fundamental: string) => {
    setSelectedFundamental(fundamental);
    setStep(5);
  };

  const selectDirection = (dir: string) => {
    setSelectedDir(dir);
    setStep(6);
  };

  const selectOutcome = (outcome: string) => {
    if (selectedPlayerIdx === null || selectedServeType === null || selectedServeZone === null || selectedFundamental === null || selectedDir === null) return;
    const player = players[selectedPlayerIdx];
    const rec: Reception = {
      id: Date.now(),
      playerIndex: selectedPlayerIdx,
      playerName: player.name,
      zone: player.zone,
      side: getSideForZone(player.zone),
      serveType: selectedServeType,
      serveZone: selectedServeZone,
      fundamental: selectedFundamental,
      direction: selectedDir,
      outcome,
      timestamp: new Date().toLocaleString('it-IT'),
    };
    setReceptions(prev => [...prev, rec]);
    setSelectedPlayerIdx(null);
    setSelectedServeType(null);
    setSelectedServeZone(null);
    setSelectedFundamental(null);
    setSelectedDir(null);
    setStep(1);
  };

  const undoLast = () => {
    setReceptions(prev => prev.slice(0, -1));
  };

  const deleteReception = (id: number) => {
    setReceptions(prev => prev.filter(r => r.id !== id));
  };

  const resetAll = () => {
    if (!window.confirm('Sei sicuro di voler cancellare tutti i dati?')) return;
    setPlayers(DEFAULT_PLAYERS);
    setPlayerCount(3);
    setTempCount(3);
    setReceptions([]);
    setSelectedPlayerIdx(null);
    setSelectedServeType(null);
    setSelectedServeZone(null);
    setSelectedFundamental(null);
    setSelectedDir(null);
    setStep(1);
    localStorage.removeItem('vb_players');
    localStorage.removeItem('vb_receptions');
    localStorage.removeItem('vb_count');
  };

  const exportCSV = () => {
    const dirMap: Record<string, string> = {};
    DIRECTIONS.forEach(d => { dirMap[d.key] = d.label; });
    const fundMap: Record<string, string> = {};
    FUNDAMENTALS.forEach(f => { fundMap[f.key] = f.label; });
    const serveTypeMap: Record<string, string> = {};
    SERVE_TYPES.forEach(s => { serveTypeMap[s.key] = s.label; });
    const headers = ['Giocatore', 'Zona', 'Lato', 'Tipo Battuta', 'Zona Battuta', 'Fondamentale', 'Punto di ricezione', 'Esito', 'Data e ora'];
    const rows = receptions.map(r =>
      [r.playerName, r.zone, r.side, serveTypeMap[r.serveType] || r.serveType, r.serveZone, fundMap[r.fundamental] || r.fundamental, dirMap[r.direction] || r.direction, r.outcome, r.timestamp].join(';')
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

  const getDirectionStats = (playerIdx: number | null, side: string, fundamental?: string, serveType?: string, serveZone?: number) => {
    const sideZones = SIDES[side];
    const filtered = receptions.filter(r => {
      const matchPlayer = playerIdx === null || r.playerIndex === playerIdx;
      const matchSide = sideZones.includes(r.zone);
      const matchFund = !fundamental || r.fundamental === fundamental;
      const matchServeType = !serveType || r.serveType === serveType;
      const matchServeZone = !serveZone || r.serveZone === serveZone;
      return matchPlayer && matchSide && matchFund && matchServeType && matchServeZone;
    });
    const total = filtered.length;
    const counts: Record<string, number> = {};
    DIRECTIONS.forEach(d => { counts[d.key] = 0; });
    filtered.forEach(r => { counts[r.direction] = (counts[r.direction] || 0) + 1; });
    return { total, counts };
  };

  const guideMsg = step === 1
    ? '📍 Scegli la zona di provenienza della battuta'
    : step === 2
      ? '🏐 Scegli il tipo di battuta'
      : step === 3
        ? '👆 Tocca un giocatore sul campo'
        : step === 4
          ? '🤲 Scegli il fondamentale usato'
          : step === 5
            ? '🎯 Scegli dove ha colpito la palla rispetto al corpo'
            : '✅ Scegli l\'esito della ricezione';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ background: '#1e40af', color: '#fff', padding: '16px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>🏐 Scouting Ricezione</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}>Analisi della ricezione nella pallavolo</p>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(8px, 2vw, 16px)' }}>
        <section style={cardStyle}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)', fontWeight: 600, color: '#374151', padding: 0 }}
          >
            <span>⚙️ Configurazione Giocatori</span>
            <span style={{ fontSize: '1.5rem' }}>{showConfig ? '−' : '+'}</span>
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
                <button onClick={applyCount} style={btnStyle('#2563eb')}>Applica</button>
              </div>

              {players.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ width: '24px', fontWeight: 600, color: '#6b7280' }}>{idx + 1}.</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={e => updateName(idx, e.target.value)}
                    style={{ flex: 1, minWidth: '120px', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Zona:</label>
                  <select
                    value={p.zone}
                    onChange={e => updateZone(idx, parseInt(e.target.value))}
                    style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  >
                    {ALL_ZONES.map(z => <option key={z} value={z}>Zona {z}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>

        {step === 1 && (
          <section style={cardStyle}>
            <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>Zona di Provenienza della Battuta</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              {SERVE_ZONES.map(sz => (
                <button
                  key={sz.zone}
                  onClick={() => selectServeZone(sz.zone)}
                  style={{
                    width: 'clamp(90px, 25vw, 110px)',
                    height: 'clamp(70px, 18vw, 85px)',
                    borderRadius: '12px',
                    background: selectedServeZone === sz.zone ? '#2563eb' : '#f3f4f6',
                    color: selectedServeZone === sz.zone ? '#fff' : '#374151',
                    border: selectedServeZone === sz.zone ? '3px solid #1d4ed8' : '2px solid #d1d5db',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)' }}>📍</span>
                  <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)', marginTop: '4px' }}>{sz.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section style={cardStyle}>
            <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>Tipo di Battuta</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {SERVE_TYPES.map(s => (
                <button
                  key={s.key}
                  onClick={() => selectServeType(s.key)}
                  style={{
                    width: 'clamp(80px, 22vw, 100px)',
                    height: 'clamp(70px, 18vw, 85px)',
                    borderRadius: '12px',
                    background: selectedServeType === s.key ? '#2563eb' : '#f3f4f6',
                    color: selectedServeType === s.key ? '#fff' : '#374151',
                    border: selectedServeType === s.key ? '3px solid #1d4ed8' : '2px solid #d1d5db',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>{s.emoji}</span>
                  <span style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', marginTop: '2px', fontWeight: 700 }}>{s.key}</span>
                  <span style={{ fontSize: 'clamp(0.6rem, 2vw, 0.7rem)', marginTop: '2px' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section style={cardStyle}>
          <h2 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Campo da Gioco</h2>
          <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
            <div style={{ height: '10px', background: 'linear-gradient(90deg, #4b5563, #9ca3af, #4b5563)', borderRadius: '6px 6px 0 0' }} />
            <div style={{
              background: 'linear-gradient(180deg, #fef3c7, #fde68a)',
              border: '4px solid #b45309',
              borderRadius: '0 0 8px 8px',
              padding: '8px',
              position: 'relative',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '4px', aspectRatio: '3/2.5' }}>
                {ZONE_GRID.flat().map(zone => {
                  const pIdx = players.findIndex(p => p.zone === zone);
                  const player = pIdx >= 0 ? players[pIdx] : null;
                  const isSelected = pIdx === selectedPlayerIdx;
                  const isZone6 = zone === 6;

                  return (
                    <div
                      key={zone}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.4)',
                        transform: isZone6 ? 'translateY(-6px)' : undefined,
                        zIndex: isZone6 ? 10 : 1,
                      }}
                    >
                      <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: 'clamp(8px, 2vw, 10px)', fontWeight: 700, color: 'rgba(120,53,15,0.5)' }}>{zone}</span>
                      {player ? (
                        <button
                          onClick={() => selectPlayer(pIdx)}
                          style={{
                            width: 'clamp(44px, 15vw, 56px)',
                            height: 'clamp(44px, 15vw, 56px)',
                            borderRadius: '50%',
                            border: isSelected ? '3px solid #2563eb' : '2px solid #d1d5db',
                            background: isSelected ? '#2563eb' : '#fff',
                            color: isSelected ? '#fff' : '#1f2937',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isSelected ? '0 0 0 4px rgba(37,99,235,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.15s',
                            padding: '2px',
                          }}
                        >
                          <span style={{ fontSize: 'clamp(8px, 2.5vw, 10px)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'clamp(36px, 12vw, 48px)' }}>{player.name}</span>
                          <span style={{ fontSize: 'clamp(7px, 2vw, 9px)', opacity: 0.7 }}>Z.{zone}</span>
                        </button>
                      ) : (
                        <div style={{ width: 'clamp(28px, 10vw, 36px)', height: 'clamp(28px, 10vw, 36px)', borderRadius: '50%', border: '1px dashed rgba(180,83,9,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 'clamp(7px, 2vw, 9px)', color: '#92400e' }}>Z.{zone}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', color: '#6b7280', fontStyle: 'italic' }}>{guideMsg}</p>
        </section>

        {step === 4 && (
          <section style={cardStyle}>
            <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>Quale fondamentale hai usato?</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              {FUNDAMENTALS.map(f => (
                <button
                  key={f.key}
                  onClick={() => selectFundamental(f.key)}
                  style={{
                    width: 'clamp(120px, 35vw, 160px)',
                    height: 'clamp(80px, 22vw, 100px)',
                    borderRadius: '12px',
                    background: selectedFundamental === f.key ? '#2563eb' : '#f3f4f6',
                    color: selectedFundamental === f.key ? '#fff' : '#374151',
                    border: selectedFundamental === f.key ? '3px solid #1d4ed8' : '2px solid #d1d5db',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)' }}>{f.emoji}</span>
                  <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)', marginTop: '4px' }}>{f.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section style={cardStyle}>
            <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>Dove ha colpito la palla?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
              <div />
              <button onClick={() => selectDirection('up')} style={dirBtnStyle(selectedDir === 'up')} title="Davanti al corpo">
                <span style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>▲</span>
                <span style={{ fontSize: 'clamp(7px, 2vw, 8px)', marginTop: '2px' }}>Davanti</span>
              </button>
              <div />
              <button onClick={() => selectDirection('left')} style={dirBtnStyle(selectedDir === 'left')} title="A sinistra del corpo">
                <span style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>◀</span>
                <span style={{ fontSize: 'clamp(7px, 2vw, 8px)', marginTop: '2px' }}>Sinistra</span>
              </button>
              <button onClick={() => selectDirection('center')} style={dirBtnStyle(selectedDir === 'center')} title="Al corpo">
                <span style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>●</span>
                <span style={{ fontSize: 'clamp(7px, 2vw, 8px)', marginTop: '2px' }}>Al corpo</span>
              </button>
              <button onClick={() => selectDirection('right')} style={dirBtnStyle(selectedDir === 'right')} title="A destra del corpo">
                <span style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>▶</span>
                <span style={{ fontSize: 'clamp(7px, 2vw, 8px)', marginTop: '2px' }}>Destra</span>
              </button>
              <div />
              <button onClick={() => selectDirection('down')} style={dirBtnStyle(selectedDir === 'down')} title="Dietro al corpo">
                <span style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>▼</span>
                <span style={{ fontSize: 'clamp(7px, 2vw, 8px)', marginTop: '2px' }}>Dietro</span>
              </button>
              <div />
            </div>
          </section>
        )}

        {step === 6 && (
          <section style={cardStyle}>
            <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>Esito della ricezione</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {OUTCOMES.map(o => (
                <button
                  key={o.key}
                  onClick={() => selectOutcome(o.key)}
                  style={{
                    width: 'clamp(60px, 18vw, 72px)',
                    height: 'clamp(60px, 18vw, 72px)',
                    borderRadius: '12px',
                    background: o.bg,
                    color: o.fg,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  {o.key}
                  <span style={{ fontSize: 'clamp(8px, 2vw, 9px)', fontWeight: 400, marginTop: '2px' }}>{o.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Comandi</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button onClick={undoLast} disabled={receptions.length === 0} style={{ ...btnStyle('#eab308'), opacity: receptions.length === 0 ? 0.4 : 1 }}>↩️ Annulla ultimo</button>
            <button onClick={resetAll} style={btnStyle('#dc2626')}>🗑️ Azzera dati</button>
            <button onClick={exportCSV} disabled={receptions.length === 0} style={{ ...btnStyle('#16a34a'), opacity: receptions.length === 0 ? 0.4 : 1 }}>📊 Esporta CSV</button>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>Ricezioni registrate: <strong>{receptions.length}</strong></p>
        </section>

        {receptions.length > 0 && (
          <section style={cardStyle}>
            <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>📋 Storico Ricezioni</h2>
            <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#6b7280' }}>Clicca su "Annulla" per eliminare una ricezione specifica e reinserirla</p>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px', fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Zona Battuta</th>
                    <th style={thStyle}>Tipo Battuta</th>
                    <th style={thStyle}>Giocatore</th>
                    <th style={thStyle}>Zona</th>
                    <th style={thStyle}>Fondamentale</th>
                    <th style={thStyle}>Direzione</th>
                    <th style={thStyle}>Esito</th>
                    <th style={thStyle}>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {receptions.slice().reverse().map((r, idx) => {
                    const serveTypeInfo = SERVE_TYPES.find(s => s.key === r.serveType);
                    const fundInfo = FUNDAMENTALS.find(f => f.key === r.fundamental);
                    const dirInfo = DIRECTIONS.find(d => d.key === r.direction);
                    const outInfo = OUTCOMES.find(o => o.key === r.outcome);
                    return (
                      <tr key={r.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{receptions.length - idx}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>Z{r.serveZone}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{serveTypeInfo?.emoji} {r.serveType}</td>
                        <td style={tdStyle}>{r.playerName}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>Z{r.zone}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{fundInfo?.emoji} {r.fundamental}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{dirInfo?.symbol}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: outInfo?.bg, color: outInfo?.fg, fontWeight: 700 }}>
                            {r.outcome}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button
                            onClick={() => deleteReception(r.id)}
                            style={{
                              padding: '4px 10px',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            Annulla
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Statistiche per Esito</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Giocatore</th>
                  <th style={thStyle}>Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key} style={thStyle}>
                      <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: o.bg, color: o.fg, lineHeight: '24px', fontSize: '12px', fontWeight: 700 }}>{o.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => {
                  const { total, counts } = getOutcomeStats(r => r.playerIndex === idx);
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={tdStyle}>{p.name}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'center' }}>{total}</td>
                      {OUTCOMES.map(o => (
                        <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>SQUADRA</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{receptions.length}</td>
                  {OUTCOMES.map(o => {
                    const c = receptions.filter(r => r.outcome === o.key).length;
                    return (
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
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

        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Punto di Ricezione per Lato</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle} rowSpan={2}>Giocatore</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Sinistra (4-7-5)</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Centro (3-8-6)</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Destra (2-9-1)</th>
                </tr>
                <tr>
                  {['S', 'C', 'D'].map(s =>
                    DIRECTIONS.map(d => (
                      <th key={`${s}-${d.key}`} style={{ ...thStyle, fontSize: '14px', padding: '4px' }} title={d.label}>{d.symbol}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={tdStyle}>{p.name}</td>
                    {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                      const { total, counts } = getDirectionStats(idx, side);
                      return DIRECTIONS.map(d => (
                        <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
                          <div style={{ fontWeight: 700 }}>{counts[d.key]}</div>
                          <div style={{ fontSize: '9px', color: '#6b7280' }}>{pct(counts[d.key], total)}</div>
                        </td>
                      ));
                    })}
                  </tr>
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>SQUADRA</td>
                  {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                    const { total, counts } = getDirectionStats(null, side);
                    return DIRECTIONS.map(d => (
                      <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
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

        {/* Statistiche per Esito - BAGHER */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>🤲 Statistiche per Esito - BAGHER</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Giocatore</th>
                  <th style={thStyle}>Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key} style={thStyle}>
                      <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: o.bg, color: o.fg, lineHeight: '24px', fontSize: '12px', fontWeight: 700 }}>{o.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => {
                  const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.fundamental === 'B');
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={tdStyle}>{p.name}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'center' }}>{total}</td>
                      {OUTCOMES.map(o => (
                        <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>SQUADRA</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{receptions.filter(r => r.fundamental === 'B').length}</td>
                  {OUTCOMES.map(o => {
                    const c = receptions.filter(r => r.outcome === o.key && r.fundamental === 'B').length;
                    const total = receptions.filter(r => r.fundamental === 'B').length;
                    return (
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                        <div>{c}</div>
                        <div style={{ fontSize: '10px', color: '#374151' }}>{pct(c, total)}</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Statistiche per Esito - PALLEGGIO */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>👐 Statistiche per Esito - PALLEGGIO</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Giocatore</th>
                  <th style={thStyle}>Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key} style={thStyle}>
                      <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: o.bg, color: o.fg, lineHeight: '24px', fontSize: '12px', fontWeight: 700 }}>{o.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => {
                  const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.fundamental === 'P');
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={tdStyle}>{p.name}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'center' }}>{total}</td>
                      {OUTCOMES.map(o => (
                        <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>SQUADRA</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{receptions.filter(r => r.fundamental === 'P').length}</td>
                  {OUTCOMES.map(o => {
                    const c = receptions.filter(r => r.outcome === o.key && r.fundamental === 'P').length;
                    const total = receptions.filter(r => r.fundamental === 'P').length;
                    return (
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                        <div>{c}</div>
                        <div style={{ fontSize: '10px', color: '#374151' }}>{pct(c, total)}</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Punto di Ricezione per Lato - BAGHER */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>🤲 Punto di Ricezione per Lato - BAGHER</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle} rowSpan={2}>Giocatore</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Sinistra (4-7-5)</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Centro (3-8-6)</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Destra (2-9-1)</th>
                </tr>
                <tr>
                  {['S', 'C', 'D'].map(s =>
                    DIRECTIONS.map(d => (
                      <th key={`${s}-${d.key}`} style={{ ...thStyle, fontSize: '14px', padding: '4px' }} title={d.label}>{d.symbol}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={tdStyle}>{p.name}</td>
                    {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                      const { total, counts } = getDirectionStats(idx, side, 'B');
                      return DIRECTIONS.map(d => (
                        <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
                          <div style={{ fontWeight: 700 }}>{counts[d.key]}</div>
                          <div style={{ fontSize: '9px', color: '#6b7280' }}>{pct(counts[d.key], total)}</div>
                        </td>
                      ));
                    })}
                  </tr>
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>SQUADRA</td>
                  {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                    const { total, counts } = getDirectionStats(null, side, 'B');
                    return DIRECTIONS.map(d => (
                      <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
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

        {/* Punto di Ricezione per Lato - PALLEGGIO */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>👐 Punto di Ricezione per Lato - PALLEGGIO</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle} rowSpan={2}>Giocatore</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Sinistra (4-7-5)</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Centro (3-8-6)</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>Destra (2-9-1)</th>
                </tr>
                <tr>
                  {['S', 'C', 'D'].map(s =>
                    DIRECTIONS.map(d => (
                      <th key={`${s}-${d.key}`} style={{ ...thStyle, fontSize: '14px', padding: '4px' }} title={d.label}>{d.symbol}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={tdStyle}>{p.name}</td>
                    {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                      const { total, counts } = getDirectionStats(idx, side, 'P');
                      return DIRECTIONS.map(d => (
                        <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
                          <div style={{ fontWeight: 700 }}>{counts[d.key]}</div>
                          <div style={{ fontSize: '9px', color: '#6b7280' }}>{pct(counts[d.key], total)}</div>
                        </td>
                      ));
                    })}
                  </tr>
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>SQUADRA</td>
                  {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                    const { total, counts } = getDirectionStats(null, side, 'P');
                    return DIRECTIONS.map(d => (
                      <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
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

        {/* Statistiche per Tipo di Battuta */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>🏐 Statistiche per Tipo di Battuta</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Giocatore</th>
                  <th style={thStyle}>Tipo Battuta</th>
                  <th style={thStyle}>Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key} style={thStyle}>
                      <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: o.bg, color: o.fg, lineHeight: '24px', fontSize: '12px', fontWeight: 700 }}>{o.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  SERVE_TYPES.map(s => {
                    const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.serveType === s.key);
                    if (total === 0) return null;
                    return (
                      <tr key={`${idx}-${s.key}`} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={tdStyle}>{p.name}</td>
                        <td style={tdStyle}>{s.emoji} {s.label}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'center' }}>{total}</td>
                        {OUTCOMES.map(o => (
                          <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                            <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle} colSpan={2}>SQUADRA</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{receptions.length}</td>
                  {OUTCOMES.map(o => {
                    const c = receptions.filter(r => r.outcome === o.key).length;
                    return (
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
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

        {/* Statistiche per Zona di Provenienza */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>📍 Statistiche per Zona di Provenienza</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Giocatore</th>
                  <th style={thStyle}>Zona Battuta</th>
                  <th style={thStyle}>Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key} style={thStyle}>
                      <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: o.bg, color: o.fg, lineHeight: '24px', fontSize: '12px', fontWeight: 700 }}>{o.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  SERVE_ZONES.map(sz => {
                    const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.serveZone === sz.zone);
                    if (total === 0) return null;
                    return (
                      <tr key={`${idx}-${sz.zone}`} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={tdStyle}>{p.name}</td>
                        <td style={tdStyle}>{sz.label}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'center' }}>{total}</td>
                        {OUTCOMES.map(o => (
                          <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
                            <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle} colSpan={2}>SQUADRA</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{receptions.length}</td>
                  {OUTCOMES.map(o => {
                    const c = receptions.filter(r => r.outcome === o.key).length;
                    return (
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center' }}>
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

        {/* Tabella Incrociata: Tipo Battuta x Zona Provenienza */}
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>📊 Distribuzione: Tipo Battuta x Zona Provenienza</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Tipo Battuta</th>
                  {SERVE_ZONES.map(sz => (
                    <th key={sz.zone} style={thStyle}>{sz.label}</th>
                  ))}
                  <th style={thStyle}>Totale</th>
                </tr>
              </thead>
              <tbody>
                {SERVE_TYPES.map(s => (
                  <tr key={s.key} style={{ background: '#fff' }}>
                    <td style={tdStyle}>{s.emoji} {s.label}</td>
                    {SERVE_ZONES.map(sz => {
                      const count = receptions.filter(r => r.serveType === s.key && r.serveZone === sz.zone).length;
                      const total = receptions.filter(r => r.serveType === s.key).length;
                      return (
                        <td key={sz.zone} style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{count}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(count, total)}</div>
                        </td>
                      );
                    })}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
                      {receptions.filter(r => r.serveType === s.key).length}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#dbeafe', fontWeight: 700 }}>
                  <td style={tdStyle}>Totale</td>
                  {SERVE_ZONES.map(sz => (
                    <td key={sz.zone} style={{ ...tdStyle, textAlign: 'center' }}>
                      {receptions.filter(r => r.serveZone === sz.zone).length}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{receptions.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function dirBtnStyle(selected: boolean): React.CSSProperties {
  return {
    width: 'clamp(60px, 18vw, 72px)',
    height: 'clamp(60px, 18vw, 72px)',
    borderRadius: '12px',
    border: selected ? '3px solid #2563eb' : '2px solid #d1d5db',
    background: selected ? '#2563eb' : '#f3f4f6',
    color: selected ? '#fff' : '#374151',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
  };
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  padding: '16px',
  marginBottom: '16px',
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '10px 16px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
});

const thStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  padding: '8px 6px',
  background: '#1e40af',
  color: '#fff',
  textAlign: 'center',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  padding: '6px',
};
