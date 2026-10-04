import { useState, useEffect, useCallback } from 'react';

// Types
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

// Constants
const ZONES = [4, 3, 2, 7, 8, 9, 5, 6, 1]; // Grid order: top-left to bottom-right
const ZONE_POSITIONS: Record<number, { row: number; col: number }> = {
  4: { row: 0, col: 0 },
  3: { row: 0, col: 1 },
  2: { row: 0, col: 2 },
  7: { row: 1, col: 0 },
  8: { row: 1, col: 1 },
  9: { row: 1, col: 2 },
  5: { row: 2, col: 0 },
  6: { row: 2, col: 1 },
  1: { row: 2, col: 2 },
};

const DIRECTIONS = [
  { key: 'up', symbol: '▲', label: 'Davanti al corpo' },
  { key: 'left', symbol: '◀', label: 'A sinistra del corpo' },
  { key: 'center', symbol: '●', label: 'Al corpo' },
  { key: 'right', symbol: '▶', label: 'A destra del corpo' },
  { key: 'down', symbol: '▼', label: 'Dietro al corpo' },
];

const OUTCOMES = [
  { key: '#', label: 'Perfetta', color: 'bg-green-600 text-white' },
  { key: '+', label: 'Buona', color: 'bg-green-300 text-black' },
  { key: '!', label: 'Discreta', color: 'bg-yellow-400 text-black' },
  { key: '-', label: 'Debole', color: 'bg-orange-400 text-white' },
  { key: '/', label: 'Errore', color: 'bg-red-500 text-white' },
  { key: '=', label: 'Annullata', color: 'bg-gray-400 text-white' },
];

const SIDES: Record<string, number[]> = {
  'Sinistra': [4, 7, 5],
  'Centro': [3, 8, 6],
  'Destra': [2, 9, 1],
};

function getSideForZone(zone: number): string {
  for (const [side, zones] of Object.entries(SIDES)) {
    if (zones.includes(zone)) return side;
  }
  return 'Centro';
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.warn('Error loading from localStorage:', e);
  }
  return defaultValue;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Error saving to localStorage:', e);
  }
}

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: 'Giocatore 1', zone: 5 },
  { id: 2, name: 'Giocatore 2', zone: 6 },
  { id: 3, name: 'Giocatore 3', zone: 1 },
];

export default function App() {
  const [players, setPlayers] = useState<Player[]>(() =>
    loadFromStorage('volleyball_players', DEFAULT_PLAYERS)
  );
  const [receptions, setReceptions] = useState<Reception[]>(() =>
    loadFromStorage('volleyball_receptions', [])
  );
  const [playerCount, setPlayerCount] = useState<number>(() =>
    loadFromStorage('volleyball_player_count', 3)
  );
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [step, setStep] = useState<'select-player' | 'select-direction' | 'select-outcome'>('select-player');
  const [showConfig, setShowConfig] = useState(false);

  // Save to localStorage
  useEffect(() => {
    saveToStorage('volleyball_players', players);
  }, [players]);

  useEffect(() => {
    saveToStorage('volleyball_receptions', receptions);
  }, [receptions]);

  useEffect(() => {
    saveToStorage('volleyball_player_count', playerCount);
  }, [playerCount]);

  const handlePlayerCountChange = useCallback((count: number) => {
    const newCount = Math.max(2, Math.min(6, count));
    setPlayerCount(newCount);
    const newPlayers: Player[] = [];
    for (let i = 0; i < newCount; i++) {
      if (i < players.length) {
        newPlayers.push(players[i]);
      } else {
        newPlayers.push({
          id: i + 1,
          name: `Giocatore ${i + 1}`,
          zone: ZONES[i % ZONES.length],
        });
      }
    }
    setPlayers(newPlayers);
  }, [players]);

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], name };
    setPlayers(newPlayers);
  };

  const updatePlayerZone = (index: number, zone: number) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], zone };
    setPlayers(newPlayers);
  };

  const handlePlayerClick = (playerIndex: number) => {
    setSelectedPlayer(playerIndex);
    setSelectedDirection(null);
    setStep('select-direction');
  };

  const handleDirectionClick = (direction: string) => {
    setSelectedDirection(direction);
    setStep('select-outcome');
  };

  const handleOutcomeClick = (outcome: string) => {
    if (selectedPlayer === null || selectedDirection === null) return;
    const player = players[selectedPlayer];
    const newReception: Reception = {
      id: Date.now(),
      playerIndex: selectedPlayer,
      playerName: player.name,
      zone: player.zone,
      side: getSideForZone(player.zone),
      direction: selectedDirection,
      outcome,
      timestamp: new Date().toLocaleString('it-IT'),
    };
    setReceptions([...receptions, newReception]);
    setSelectedPlayer(null);
    setSelectedDirection(null);
    setStep('select-player');
  };

  const handleUndoLast = () => {
    if (receptions.length > 0) {
      setReceptions(receptions.slice(0, -1));
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata.')) {
      setPlayers(DEFAULT_PLAYERS);
      setPlayerCount(3);
      setReceptions([]);
      setSelectedPlayer(null);
      setSelectedDirection(null);
      setStep('select-player');
      localStorage.removeItem('volleyball_players');
      localStorage.removeItem('volleyball_receptions');
      localStorage.removeItem('volleyball_player_count');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Giocatore', 'Zona', 'Lato', 'Punto di ricezione', 'Esito', 'Data e ora'];
    const rows = receptions.map(r => {
      const dirLabel = DIRECTIONS.find(d => d.key === r.direction)?.label || r.direction;
      return [r.playerName, r.zone, r.side, dirLabel, r.outcome, r.timestamp];
    });
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricezioni_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Statistics calculations
  const getPlayerStats = (playerIndex: number | null) => {
    const filtered = playerIndex === null ? receptions : receptions.filter(r => r.playerIndex === playerIndex);
    const total = filtered.length;
    const stats: Record<string, number> = {};
    OUTCOMES.forEach(o => { stats[o.key] = 0; });
    filtered.forEach(r => { stats[r.outcome] = (stats[r.outcome] || 0) + 1; });
    return { total, stats };
  };

  const getDirectionStats = (playerIndex: number | null, side: string) => {
    const sideZones = SIDES[side];
    const filtered = (playerIndex === null ? receptions : receptions.filter(r => r.playerIndex === playerIndex))
      .filter(r => sideZones.includes(r.zone));
    const total = filtered.length;
    const dirStats: Record<string, number> = {};
    DIRECTIONS.forEach(d => { dirStats[d.key] = 0; });
    filtered.forEach(r => { dirStats[r.direction] = (dirStats[r.direction] || 0) + 1; });
    return { total, dirStats };
  };

  const formatPercent = (count: number, total: number): string => {
    if (total === 0) return '–';
    return `${Math.round((count / total) * 100)}%`;
  };

  // Render court
  const renderCourt = () => {
    const grid: (Player | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];

    players.forEach((player, idx) => {
      const pos = ZONE_POSITIONS[player.zone];
      if (pos) {
        grid[pos.row][pos.col] = { ...player, id: idx + 1 };
      }
    });

    return (
      <div className="relative mx-auto w-full max-w-md">
        {/* Net */}
        <div className="h-3 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-t-lg mb-1 shadow-md"></div>
        {/* Court */}
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-600 rounded-b-lg p-2 relative" style={{ aspectRatio: '3/2.5' }}>
          {/* Court lines */}
          <div className="absolute inset-2 border-2 border-white/50 rounded pointer-events-none"></div>
          <div className="absolute left-2 right-2 top-1/3 border-t-2 border-white/50 pointer-events-none"></div>
          <div className="absolute left-2 right-2 top-2/3 border-t-2 border-white/50 pointer-events-none"></div>
          <div className="absolute top-2 bottom-2 left-1/3 border-l-2 border-white/50 pointer-events-none"></div>
          <div className="absolute top-2 bottom-2 left-2/3 border-l-2 border-white/50 pointer-events-none"></div>

          {/* Grid cells */}
          <div className="grid grid-cols-3 grid-rows-3 h-full gap-1 relative z-10">
            {ZONES.map((zone) => {
              const playerIdx = players.findIndex(p => p.zone === zone);
              const player = playerIdx >= 0 ? players[playerIdx] : null;
              const pos = ZONE_POSITIONS[zone];
              const isZone6 = zone === 6;

              return (
                <div
                  key={zone}
                  className={`relative flex items-center justify-center ${isZone6 ? 'z-20' : ''}`}
                  style={isZone6 ? { transform: 'translateY(-8px) scale(1.05)' } : {}}
                >
                  {/* Zone label */}
                  <span className="absolute top-0.5 left-1 text-xs font-bold text-amber-800/60">{zone}</span>
                  {player && (
                    <button
                      onClick={() => handlePlayerClick(playerIdx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 shadow-lg
                        ${selectedPlayer === playerIdx
                          ? 'bg-blue-500 text-white ring-4 ring-blue-300 scale-110'
                          : 'bg-white/90 text-gray-800 hover:bg-blue-100 hover:scale-105'
                        }`}
                    >
                      <span className="text-[10px] sm:text-xs truncate max-w-full px-1">{player.name}</span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500">Z.{zone}</span>
                    </button>
                  )}
                  {!player && (
                    <div className="w-10 h-10 rounded-full bg-white/30 border border-dashed border-amber-400 flex items-center justify-center">
                      <span className="text-[10px] text-amber-600">Z.{zone}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <header className="bg-blue-700 text-white py-4 px-4 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center">🏐 Scouting Ricezione</h1>
        <p className="text-center text-blue-200 text-sm mt-1">Pallavolo - Analisi della ricezione</p>
      </header>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-4">
        {/* Configuration Card */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex justify-between items-center text-lg font-semibold text-gray-700"
          >
            <span>⚙️ Configurazione Giocatori</span>
            <span className="text-2xl">{showConfig ? '−' : '+'}</span>
          </button>

          {showConfig && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="font-medium text-gray-700">Numero giocatori:</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value) || 2)}
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold"
                />
                <button
                  onClick={() => handlePlayerCountChange(playerCount)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Applica
                </button>
              </div>

              <div className="space-y-2">
                {players.map((player, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500 w-6">{idx + 1}.</span>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(idx, e.target.value)}
                      className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      placeholder="Nome giocatore"
                    />
                    <label className="text-sm text-gray-600">Zona:</label>
                    <select
                      value={player.zone}
                      onChange={(e) => updatePlayerZone(idx, parseInt(e.target.value))}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                      {ZONES.map(z => (
                        <option key={z} value={z}>Zona {z}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Court Card */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">Campo da Gioco</h2>
          {renderCourt()}
          <p className="text-center text-sm text-gray-500 mt-3 italic">
            {step === 'select-player' && '👆 Tocca un giocatore sul campo'}
            {step === 'select-direction' && '🎯 Scegli dove ha colpito la palla rispetto al corpo'}
            {step === 'select-outcome' && '✅ Scegli l\'esito della ricezione'}
          </p>
        </div>

        {/* Direction Selection */}
        {step === 'select-direction' && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-center font-semibold text-gray-700 mb-3">
              Dove ha colpito la palla?
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {DIRECTIONS.map(dir => (
                <button
                  key={dir.key}
                  onClick={() => handleDirectionClick(dir.key)}
                  title={dir.label}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-2xl sm:text-3xl font-bold transition-all duration-150
                    ${selectedDirection === dir.key
                      ? 'bg-blue-500 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:scale-105 shadow'
                    }`}
                >
                  {dir.symbol}
                  <span className="block text-[8px] sm:text-[9px] font-normal mt-0.5 leading-tight">{dir.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Outcome Selection */}
        {step === 'select-outcome' && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-center font-semibold text-gray-700 mb-3">
              Esito della ricezione
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {OUTCOMES.map(outcome => (
                <button
                  key={outcome.key}
                  onClick={() => handleOutcomeClick(outcome.key)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-xl sm:text-2xl font-bold transition-all duration-150 hover:scale-105 shadow-lg
                    ${outcome.color}`}
                >
                  {outcome.key}
                  <span className="block text-[9px] sm:text-[10px] font-normal mt-0.5">{outcome.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Commands */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Comandi</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUndoLast}
              disabled={receptions.length === 0}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↩️ Annulla ultimo
            </button>
            <button
              onClick={handleResetAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              🗑️ Azzera dati
            </button>
            <button
              onClick={handleExportCSV}
              disabled={receptions.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📊 Esporta CSV
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Ricezioni registrate: {receptions.length}</p>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Statistiche per Esito</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 px-2 py-2 text-left">Giocatore</th>
                  <th className="border border-gray-300 px-2 py-2 text-center">Tot</th>
                  {OUTCOMES.map(o => (
                    <th key={o.key} className="border border-gray-300 px-1 py-2 text-center">
                      <span className={`inline-block w-6 h-6 rounded-full text-xs leading-6 ${o.color}`}>{o.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => {
                  const { total, stats } = getPlayerStats(idx);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-1.5 font-medium">{player.name}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center font-bold">{total}</td>
                      {OUTCOMES.map(o => (
                        <td key={o.key} className="border border-gray-300 px-1 py-1.5 text-center">
                          <div className="font-bold">{stats[o.key]}</div>
                          <div className="text-[10px] text-gray-500">{formatPercent(stats[o.key], total)}</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {/* Team totals */}
                <tr className="bg-blue-100 font-bold">
                  <td className="border border-gray-300 px-2 py-1.5">SQUADRA</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{receptions.length}</td>
                  {OUTCOMES.map(o => {
                    const count = receptions.filter(r => r.outcome === o.key).length;
                    return (
                      <td key={o.key} className="border border-gray-300 px-1 py-1.5 text-center">
                        <div>{count}</div>
                        <div className="text-[10px] text-gray-600">{formatPercent(count, receptions.length)}</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Direction by Side Table */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Punto di Ricezione per Lato</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 px-2 py-2 text-left" rowSpan={2}>Giocatore</th>
                  <th className="border border-gray-300 px-1 py-1 text-center" colSpan={5}>Sinistra (4-7-5)</th>
                  <th className="border border-gray-300 px-1 py-1 text-center" colSpan={5}>Centro (3-8-6)</th>
                  <th className="border border-gray-300 px-1 py-1 text-center" colSpan={5}>Destra (2-9-1)</th>
                </tr>
                <tr className="bg-blue-50">
                  {['Sinistra', 'Centro', 'Destra'].map(() =>
                    DIRECTIONS.map(d => (
                      <th key={d.key} className="border border-gray-300 px-0.5 py-1 text-center" title={d.label}>
                        <span className="text-sm">{d.symbol}</span>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1.5 font-medium">{player.name}</td>
                    {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                      const { total, dirStats } = getDirectionStats(idx, side);
                      return DIRECTIONS.map(d => (
                        <td key={`${side}-${d.key}`} className="border border-gray-300 px-0.5 py-1 text-center">
                          <div className="font-bold text-[11px]">{dirStats[d.key]}</div>
                          <div className="text-[9px] text-gray-500">{formatPercent(dirStats[d.key], total)}</div>
                        </td>
                      ));
                    })}
                  </tr>
                ))}
                {/* Team totals */}
                <tr className="bg-blue-100 font-bold">
                  <td className="border border-gray-300 px-2 py-1.5">SQUADRA</td>
                  {(['Sinistra', 'Centro', 'Destra'] as const).map(side => {
                    const { total, dirStats } = getDirectionStats(null, side);
                    return DIRECTIONS.map(d => (
                      <td key={`${side}-${d.key}`} className="border border-gray-300 px-0.5 py-1 text-center">
                        <div className="text-[11px]">{dirStats[d.key]}</div>
                        <div className="text-[9px] text-gray-600">{formatPercent(dirStats[d.key], total)}</div>
                      </td>
                    ));
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reception History */}
        {receptions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Storico Ricezioni</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 px-2 py-2">#</th>
                    <th className="border border-gray-300 px-2 py-2">Giocatore</th>
                    <th className="border border-gray-300 px-2 py-2">Zona</th>
                    <th className="border border-gray-300 px-2 py-2">Lato</th>
                    <th className="border border-gray-300 px-2 py-2">Direzione</th>
                    <th className="border border-gray-300 px-2 py-2">Esito</th>
                    <th className="border border-gray-300 px-2 py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {receptions.slice().reverse().slice(0, 20).map((r, i) => {
                    const dirInfo = DIRECTIONS.find(d => d.key === r.direction);
                    const outInfo = OUTCOMES.find(o => o.key === r.outcome);
                    return (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-1 text-center">{receptions.length - i}</td>
                        <td className="border border-gray-300 px-2 py-1">{r.playerName}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{r.zone}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{r.side}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center" title={dirInfo?.label}>{dirInfo?.symbol}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${outInfo?.color}`}>{r.outcome}</span>
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center text-[10px]">{r.timestamp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {receptions.length > 20 && (
              <p className="text-center text-xs text-gray-500 mt-2">Mostrate le ultime 20 di {receptions.length} ricezioni</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4">
        Scouting Ricezione Pallavolo © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
