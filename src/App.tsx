import React, { useState, useEffect } from 'react';
import { SoglieProvider, useSoglie } from './context/SoglieContext'; // NUOVO - Provider soglie globali
import ConfigSoglieUI from './components/ConfigSoglieUI'; // NUOVO - Pannello configurazione soglie
import { getStatoColore, getColoreCSS } from './utils/valutaColori'; // NUOVO - Valutazione colori con soglie globali
import ResocontoAnalisi from './components/ResocontoAnalisi'; // NUOVO
import AnalisiMultipla from './components/AnalisiMultipla'; // NUOVO - Analisi multi-giornata
import TabellaAnalisiIncrociata from './components/TabellaAnalisiIncrociata'; // NUOVO - Tabella pivot Zona × Tipologia
import TabellaDirezioneEsito from './components/TabellaDirezioneEsito'; // NUOVO - Tabella Direzione × Esito per Lato
import CampoGiocatoriLiberi from './components/CampoGiocatoriLiberi'; // NUOVO - Campo con giocatori spostabili

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
  speed: number | null;
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
  { zone: 6, label: 'Zona 6' },
  { zone: 5, label: 'Zona 5' },
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
  { key: '+', label: 'Positiva', bg: '#86efac', fg: '#000' },
  { key: '!', label: 'Esclamativa', bg: '#facc15', fg: '#000' },
  { key: '-', label: 'Negativa', bg: '#fb923c', fg: '#fff' },
  { key: '/', label: 'Slash', bg: '#9ca3af', fg: '#fff' },
  { key: '=', label: 'Errore', bg: '#ef4444', fg: '#fff' },
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
  // MODIFICATO PER SOGLIE GLOBALI - Usa il Context per accedere alle soglie globali
  const { soglie } = useSoglie();
  
  const [players, setPlayers] = useState<Player[]>(() => loadJSON<Player[]>('vb_players', DEFAULT_PLAYERS));
  const [receptions, setReceptions] = useState<Reception[]>(() => loadJSON<Reception[]>('vb_receptions', []));
  const [playerCount, setPlayerCount] = useState<number>(() => loadJSON<number>('vb_count', 3));
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState<number | null>(null);
  const [selectedServeType, setSelectedServeType] = useState<string | null>(null);
  const [selectedServeZone, setSelectedServeZone] = useState<number | null>(null);
  const [selectedFundamental, setSelectedFundamental] = useState<string | null>(null);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<number | null>(null);
  const [speedInput, setSpeedInput] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [showConfig, setShowConfig] = useState(false);
  const [tempCount, setTempCount] = useState(playerCount);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString('it-IT'));
  
  // NUOVO: Stato per modifica ricezione
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [editForm, setEditForm] = useState<Partial<Reception>>({});

  useEffect(() => { saveJSON('vb_players', players); }, [players]);
  useEffect(() => { saveJSON('vb_receptions', receptions); }, [receptions]);
  useEffect(() => { saveJSON('vb_count', playerCount); }, [playerCount]);
  
  // Aggiorna l'orario ogni secondo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('it-IT'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    if (step !== 1) {
      alert('Devi prima selezionare la zona di provenienza della battuta');
      return;
    }
    setSelectedServeZone(serveZone);
    setStep(2);
  };

  const selectServeType = (serveType: string) => {
    if (step !== 2 || selectedServeZone === null) {
      alert('Devi prima selezionare la zona di provenienza della battuta');
      return;
    }
    setSelectedServeType(serveType);
    setStep(3);
  };

  const selectPlayer = (idx: number) => {
    if (step !== 3 || selectedServeType === null || selectedServeZone === null) {
      alert('Devi prima selezionare zona e tipo di battuta');
      return;
    }
    setSelectedPlayerIdx(idx);
    setStep(4);
  };

  const selectFundamental = (fundamental: string) => {
    if (step !== 4 || selectedPlayerIdx === null) {
      alert('Devi prima selezionare il giocatore che riceve');
      return;
    }
    setSelectedFundamental(fundamental);
    setStep(5);
  };

  const selectDirection = (dir: string) => {
    if (step !== 5 || selectedFundamental === null) {
      alert('Devi prima selezionare il fondamentale');
      return;
    }
    setSelectedDir(dir);
    setStep(6);
  };

  const selectOutcome = (outcome: string) => {
    if (step !== 6 || selectedDir === null) {
      alert('Devi prima selezionare dove ha colpito la palla');
      return;
    }
    if (selectedPlayerIdx === null || selectedServeType === null || selectedServeZone === null || selectedFundamental === null) {
      alert('Errore: dati incompleti. Ricomincia dall\'inizio');
      setStep(1);
      return;
    }
    setSelectedOutcome(outcome);
    setSelectedSpeed(null);
    setSpeedInput('');
    setStep(7);
  };

  const saveReception = () => {
    if (selectedPlayerIdx === null || selectedServeType === null || selectedServeZone === null || selectedFundamental === null || selectedDir === null || selectedOutcome === null) return;
    const player = players[selectedPlayerIdx];
    const speed = speedInput.trim() === '' ? null : parseFloat(speedInput);
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
      outcome: selectedOutcome,
      speed: isNaN(speed as number) ? null : speed,
      timestamp: new Date().toLocaleString('it-IT'),
    };
    setReceptions(prev => [...prev, rec]);
    setSelectedPlayerIdx(null);
    setSelectedServeType(null);
    setSelectedServeZone(null);
    setSelectedFundamental(null);
    setSelectedDir(null);
    setSelectedOutcome(null);
    setSelectedSpeed(null);
    setSpeedInput('');
    setStep(1);
  };

  const undoLast = () => {
    setReceptions(prev => prev.slice(0, -1));
  };

  const deleteReception = (id: number) => {
    setReceptions(prev => prev.filter(r => r.id !== id));
  };

  // NUOVO: Funzioni per modifica ricezione
  const startEditReception = (reception: Reception) => {
    setEditingReception(reception);
    setEditForm({
      serveZone: reception.serveZone,
      serveType: reception.serveType,
      playerIndex: reception.playerIndex,
      fundamental: reception.fundamental,
      direction: reception.direction,
      outcome: reception.outcome,
      speed: reception.speed,
    });
  };

  const saveEditReception = () => {
    if (!editingReception) return;
    
    const updatedReception: Reception = {
      ...editingReception,
      ...editForm,
      playerName: players[editForm.playerIndex || 0]?.name || editingReception.playerName,
      zone: players[editForm.playerIndex || 0]?.zone || editingReception.zone,
      side: getSideForZone(players[editForm.playerIndex || 0]?.zone || editingReception.zone),
    };
    
    setReceptions(prev => prev.map(r => r.id === editingReception.id ? updatedReception : r));
    setEditingReception(null);
    setEditForm({});
  };

  const cancelEditReception = () => {
    setEditingReception(null);
    setEditForm({});
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
    setSelectedOutcome(null);
    setSelectedSpeed(null);
    setSpeedInput('');
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
    
    let csv = '\uFEFF';
    
    // 1. Ricezioni grezze
    csv += '=== RICAZIONI GREZZE ===\n';
    csv += ['Giocatore', 'Zona', 'Lato', 'Tipo Battuta', 'Zona Battuta', 'Fondamentale', 'Punto di ricezione', 'Esito', 'Velocità (km/h)', 'Data e ora'].join(';') + '\n';
    csv += receptions.map(r =>
      [players[r.playerIndex]?.name || r.playerName, r.zone, r.side, serveTypeMap[r.serveType] || r.serveType, r.serveZone, fundMap[r.fundamental] || r.fundamental, dirMap[r.direction] || r.direction, r.outcome, r.speed !== null && r.speed !== undefined ? r.speed : '', r.timestamp].join(';')
    ).join('\n');
    
    // 2. Statistiche per esito (generale)
    csv += '\n\n=== STATISTICHE PER ESITO ===\n';
    csv += ['Giocatore', 'Totale', ...OUTCOMES.map(o => `${o.key} (${o.label})`), ...OUTCOMES.map(o => `${o.key} %`)].join(';') + '\n';
    players.forEach((p, idx) => {
      const { total, counts } = getOutcomeStats(r => r.playerIndex === idx);
      csv += [p.name, total, ...OUTCOMES.map(o => counts[o.key]), ...OUTCOMES.map(o => pct(counts[o.key], total))].join(';') + '\n';
    });
    csv += ['SQUADRA', receptions.length, ...OUTCOMES.map(o => receptions.filter(r => r.outcome === o.key).length), ...OUTCOMES.map(o => pct(receptions.filter(r => r.outcome === o.key).length, receptions.length))].join(';') + '\n';
    
    // 3. Statistiche per esito - BAGHER
    csv += '\n\n=== STATISTICHE PER ESITO - BAGHER ===\n';
    csv += ['Giocatore', 'Totale', ...OUTCOMES.map(o => `${o.key} (${o.label})`), ...OUTCOMES.map(o => `${o.key} %`)].join(';') + '\n';
    players.forEach((p, idx) => {
      const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.fundamental === 'B');
      csv += [p.name, total, ...OUTCOMES.map(o => counts[o.key]), ...OUTCOMES.map(o => pct(counts[o.key], total))].join(';') + '\n';
    });
    const totalB = receptions.filter(r => r.fundamental === 'B').length;
    csv += ['SQUADRA', totalB, ...OUTCOMES.map(o => receptions.filter(r => r.outcome === o.key && r.fundamental === 'B').length), ...OUTCOMES.map(o => pct(receptions.filter(r => r.outcome === o.key && r.fundamental === 'B').length, totalB))].join(';') + '\n';
    
    // 4. Statistiche per esito - PALLEGGIO
    csv += '\n\n=== STATISTICHE PER ESITO - PALLEGGIO ===\n';
    csv += ['Giocatore', 'Totale', ...OUTCOMES.map(o => `${o.key} (${o.label})`), ...OUTCOMES.map(o => `${o.key} %`)].join(';') + '\n';
    players.forEach((p, idx) => {
      const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.fundamental === 'P');
      csv += [p.name, total, ...OUTCOMES.map(o => counts[o.key]), ...OUTCOMES.map(o => pct(counts[o.key], total))].join(';') + '\n';
    });
    const totalP = receptions.filter(r => r.fundamental === 'P').length;
    csv += ['SQUADRA', totalP, ...OUTCOMES.map(o => receptions.filter(r => r.outcome === o.key && r.fundamental === 'P').length), ...OUTCOMES.map(o => pct(receptions.filter(r => r.outcome === o.key && r.fundamental === 'P').length, totalP))].join(';') + '\n';
    
    // 5. Punto di ricezione per lato (generale)
    csv += '\n\n=== PUNTO DI RICEZIONE PER LATO ===\n';
    csv += ['Giocatore', 'Sinistra-▲', 'Sinistra-◀', 'Sinistra-●', 'Sinistra-▶', 'Sinistra-▼', 'Centro-▲', 'Centro-◀', 'Centro-●', 'Centro-▶', 'Centro-▼', 'Destra-▲', 'Destra-◀', 'Destra-●', 'Destra-▶', 'Destra-▼'].join(';') + '\n';
    players.forEach((p, idx) => {
      const row = [p.name];
      (['Sinistra', 'Centro', 'Destra'] as const).forEach(side => {
        const { total, counts } = getDirectionStats(idx, side);
        DIRECTIONS.forEach(d => {
          row.push(`${counts[d.key]} (${pct(counts[d.key], total)})`);
        });
      });
      csv += row.join(';') + '\n';
    });
    const teamRow = ['SQUADRA'];
    (['Sinistra', 'Centro', 'Destra'] as const).forEach(side => {
      const { total, counts } = getDirectionStats(null, side);
      DIRECTIONS.forEach(d => {
        teamRow.push(`${counts[d.key]} (${pct(counts[d.key], total)})`);
      });
    });
    csv += teamRow.join(';') + '\n';
    
    // 6. Statistiche per tipo di battuta
    csv += '\n\n=== STATISTICHE PER TIPO DI BATTUTA ===\n';
    csv += ['Giocatore', 'Tipo Battuta', 'Totale', ...OUTCOMES.map(o => `${o.key} (${o.label})`), ...OUTCOMES.map(o => `${o.key} %`)].join(';') + '\n';
    players.forEach((p, idx) => {
      SERVE_TYPES.forEach(s => {
        const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.serveType === s.key);
        if (total > 0) {
          csv += [p.name, `${s.label} (${s.key})`, total, ...OUTCOMES.map(o => counts[o.key]), ...OUTCOMES.map(o => pct(counts[o.key], total))].join(';') + '\n';
        }
      });
    });
    
    // 7. Statistiche per zona di provenienza
    csv += '\n\n=== STATISTICHE PER ZONA DI PROVENIENZA ===\n';
    csv += ['Giocatore', 'Zona Battuta', 'Totale', ...OUTCOMES.map(o => `${o.key} (${o.label})`), ...OUTCOMES.map(o => `${o.key} %`)].join(';') + '\n';
    players.forEach((p, idx) => {
      SERVE_ZONES.forEach(sz => {
        const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.serveZone === sz.zone);
        if (total > 0) {
          csv += [p.name, sz.label, total, ...OUTCOMES.map(o => counts[o.key]), ...OUTCOMES.map(o => pct(counts[o.key], total))].join(';') + '\n';
        }
      });
    });
    
    // 8. Distribuzione tipo battuta x zona provenienza
    csv += '\n\n=== DISTRIBUZIONE TIPO BATTUTA x ZONA PROVENIENZA ===\n';
    csv += ['Tipo Battuta', ...SERVE_ZONES.map(sz => sz.label), 'Totale'].join(';') + '\n';
    SERVE_TYPES.forEach(s => {
      const row = [`${s.label} (${s.key})`];
      SERVE_ZONES.forEach(sz => {
        const count = receptions.filter(r => r.serveType === s.key && r.serveZone === sz.zone).length;
        const total = receptions.filter(r => r.serveType === s.key).length;
        row.push(`${count} (${pct(count, total)})`);
      });
      row.push(receptions.filter(r => r.serveType === s.key).length.toString());
      csv += row.join(';') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricezioni_complete_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const dirMap: Record<string, string> = {};
    DIRECTIONS.forEach(d => { dirMap[d.key] = d.label; });
    const fundMap: Record<string, string> = {};
    FUNDAMENTALS.forEach(f => { fundMap[f.key] = f.label; });
    const serveTypeMap: Record<string, string> = {};
    SERVE_TYPES.forEach(s => { serveTypeMap[s.key] = s.label; });
    
    let html = '<html><head><meta charset="utf-8"><title>Scouting Ricezione</title></head><body>';
    
    // 1. Ricezioni grezze
    html += '<h2>Ricezioni Grezze</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th><th>Zona</th><th>Lato</th><th>Tipo Battuta</th><th>Zona Battuta</th><th>Fondamentale</th><th>Punto di ricezione</th><th>Esito</th><th>Velocità (km/h)</th><th>Data e ora</th></tr>';
    receptions.forEach(r => {
      html += '<tr>';
      html += `<td>${players[r.playerIndex]?.name || r.playerName}</td>`;
      html += `<td>${r.zone}</td>`;
      html += `<td>${r.side}</td>`;
      html += `<td>${serveTypeMap[r.serveType] || r.serveType}</td>`;
      html += `<td>${r.serveZone}</td>`;
      html += `<td>${fundMap[r.fundamental] || r.fundamental}</td>`;
      html += `<td>${dirMap[r.direction] || r.direction}</td>`;
      html += `<td>${r.outcome}</td>`;
      html += `<td>${r.speed !== null && r.speed !== undefined ? r.speed : ''}</td>`;
      html += `<td>${r.timestamp}</td>`;
      html += '</tr>';
    });
    html += '</table>';
    
    // 2. Statistiche per esito (generale)
    html += '<h2>Statistiche per Esito</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th><th>Totale</th>' + OUTCOMES.map(o => `<th>${o.key} (${o.label})</th>`).join('') + OUTCOMES.map(o => `<th>${o.key} %</th>`).join('') + '</tr>';
    players.forEach((p, idx) => {
      const { total, counts } = getOutcomeStats(r => r.playerIndex === idx);
      html += '<tr>';
      html += `<td>${p.name}</td>`;
      html += `<td>${total}</td>`;
      OUTCOMES.forEach(o => { html += `<td>${counts[o.key]}</td>`; });
      OUTCOMES.forEach(o => { html += `<td>${pct(counts[o.key], total)}</td>`; });
      html += '</tr>';
    });
    html += '<tr><td><b>SQUADRA</b></td>';
    html += `<td><b>${receptions.length}</b></td>`;
    OUTCOMES.forEach(o => { html += `<td><b>${receptions.filter(r => r.outcome === o.key).length}</b></td>`; });
    OUTCOMES.forEach(o => { html += `<td><b>${pct(receptions.filter(r => r.outcome === o.key).length, receptions.length)}</b></td>`; });
    html += '</tr></table>';
    
    // 3. Statistiche per esito - BAGHER
    html += '<h2>Statistiche per Esito - BAGHER</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th><th>Totale</th>' + OUTCOMES.map(o => `<th>${o.key} (${o.label})</th>`).join('') + OUTCOMES.map(o => `<th>${o.key} %</th>`).join('') + '</tr>';
    players.forEach((p, idx) => {
      const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.fundamental === 'B');
      html += '<tr>';
      html += `<td>${p.name}</td>`;
      html += `<td>${total}</td>`;
      OUTCOMES.forEach(o => { html += `<td>${counts[o.key]}</td>`; });
      OUTCOMES.forEach(o => { html += `<td>${pct(counts[o.key], total)}</td>`; });
      html += '</tr>';
    });
    const totalB = receptions.filter(r => r.fundamental === 'B').length;
    html += '<tr><td><b>SQUADRA</b></td>';
    html += `<td><b>${totalB}</b></td>`;
    OUTCOMES.forEach(o => { html += `<td><b>${receptions.filter(r => r.outcome === o.key && r.fundamental === 'B').length}</b></td>`; });
    OUTCOMES.forEach(o => { html += `<td><b>${pct(receptions.filter(r => r.outcome === o.key && r.fundamental === 'B').length, totalB)}</b></td>`; });
    html += '</tr></table>';
    
    // 4. Statistiche per esito - PALLEGGIO
    html += '<h2>Statistiche per Esito - PALLEGGIO</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th><th>Totale</th>' + OUTCOMES.map(o => `<th>${o.key} (${o.label})</th>`).join('') + OUTCOMES.map(o => `<th>${o.key} %</th>`).join('') + '</tr>';
    players.forEach((p, idx) => {
      const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.fundamental === 'P');
      html += '<tr>';
      html += `<td>${p.name}</td>`;
      html += `<td>${total}</td>`;
      OUTCOMES.forEach(o => { html += `<td>${counts[o.key]}</td>`; });
      OUTCOMES.forEach(o => { html += `<td>${pct(counts[o.key], total)}</td>`; });
      html += '</tr>';
    });
    const totalP = receptions.filter(r => r.fundamental === 'P').length;
    html += '<tr><td><b>SQUADRA</b></td>';
    html += `<td><b>${totalP}</b></td>`;
    OUTCOMES.forEach(o => { html += `<td><b>${receptions.filter(r => r.outcome === o.key && r.fundamental === 'P').length}</b></td>`; });
    OUTCOMES.forEach(o => { html += `<td><b>${pct(receptions.filter(r => r.outcome === o.key && r.fundamental === 'P').length, totalP)}</b></td>`; });
    html += '</tr></table>';
    
    // 5. Punto di ricezione per lato (generale)
    html += '<h2>Punto di Ricezione per Lato</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th>';
    (['Sinistra', 'Centro', 'Destra'] as const).forEach(side => {
      DIRECTIONS.forEach(d => {
        html += `<th>${side}-${d.symbol}</th>`;
      });
    });
    html += '</tr>';
    players.forEach((p, idx) => {
      html += `<tr><td>${p.name}</td>`;
      (['Sinistra', 'Centro', 'Destra'] as const).forEach(side => {
        const { total, counts } = getDirectionStats(idx, side);
        DIRECTIONS.forEach(d => {
          html += `<td>${counts[d.key]} (${pct(counts[d.key], total)})</td>`;
        });
      });
      html += '</tr>';
    });
    html += '<tr><td><b>SQUADRA</b></td>';
    (['Sinistra', 'Centro', 'Destra'] as const).forEach(side => {
      const { total, counts } = getDirectionStats(null, side);
      DIRECTIONS.forEach(d => {
        html += `<td><b>${counts[d.key]} (${pct(counts[d.key], total)})</b></td>`;
      });
    });
    html += '</tr></table>';
    
    // 6. Statistiche per tipo di battuta
    html += '<h2>Statistiche per Tipo di Battuta</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th><th>Tipo Battuta</th><th>Totale</th>' + OUTCOMES.map(o => `<th>${o.key} (${o.label})</th>`).join('') + OUTCOMES.map(o => `<th>${o.key} %</th>`).join('') + '</tr>';
    players.forEach((p, idx) => {
      SERVE_TYPES.forEach(s => {
        const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.serveType === s.key);
        if (total > 0) {
          html += '<tr>';
          html += `<td>${p.name}</td>`;
          html += `<td>${s.label} (${s.key})</td>`;
          html += `<td>${total}</td>`;
          OUTCOMES.forEach(o => { html += `<td>${counts[o.key]}</td>`; });
          OUTCOMES.forEach(o => { html += `<td>${pct(counts[o.key], total)}</td>`; });
          html += '</tr>';
        }
      });
    });
    html += '</table>';
    
    // 7. Statistiche per zona di provenienza
    html += '<h2>Statistiche per Zona di Provenienza</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Giocatore</th><th>Zona Battuta</th><th>Totale</th>' + OUTCOMES.map(o => `<th>${o.key} (${o.label})</th>`).join('') + OUTCOMES.map(o => `<th>${o.key} %</th>`).join('') + '</tr>';
    players.forEach((p, idx) => {
      SERVE_ZONES.forEach(sz => {
        const { total, counts } = getOutcomeStats(r => r.playerIndex === idx && r.serveZone === sz.zone);
        if (total > 0) {
          html += '<tr>';
          html += `<td>${p.name}</td>`;
          html += `<td>${sz.label}</td>`;
          html += `<td>${total}</td>`;
          OUTCOMES.forEach(o => { html += `<td>${counts[o.key]}</td>`; });
          OUTCOMES.forEach(o => { html += `<td>${pct(counts[o.key], total)}</td>`; });
          html += '</tr>';
        }
      });
    });
    html += '</table>';
    
    // 8. Distribuzione tipo battuta x zona provenienza
    html += '<h2>Distribuzione Tipo Battuta x Zona Provenienza</h2>';
    html += '<table border="1" style="border-collapse:collapse;">';
    html += '<tr><th>Tipo Battuta</th>' + SERVE_ZONES.map(sz => `<th>${sz.label}</th>`).join('') + '<th>Totale</th></tr>';
    SERVE_TYPES.forEach(s => {
      html += '<tr>';
      html += `<td>${s.label} (${s.key})</td>`;
      SERVE_ZONES.forEach(sz => {
        const count = receptions.filter(r => r.serveType === s.key && r.serveZone === sz.zone).length;
        const total = receptions.filter(r => r.serveType === s.key).length;
        html += `<td>${count} (${pct(count, total)})</td>`;
      });
      html += `<td><b>${receptions.filter(r => r.serveType === s.key).length}</b></td>`;
      html += '</tr>';
    });
    html += '</table>';
    
    html += '</body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricezioni_complete_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const pct = (n: number, t: number) => t === 0 ? '–' : `${Math.round((n / t) * 100)}%`;

  // MODIFICATO PER SOGLIE GLOBALI - Usa le soglie globali dal Context
  const getHighlightBg = (n: number, t: number, tipo: 'positivo' | 'negativo' | 'errore' = 'positivo'): string => {
    if (t === 0) return 'transparent';
    const percentage = (n / t) * 100;
    const stato = getStatoColore(tipo, percentage, soglie);
    return getColoreCSS(stato);
  };

  // MODIFICATO PER SOGLIE GLOBALI - Helper per determinare il tipo di esito
  const getTipoEsito = (esito: string): 'positivo' | 'negativo' | 'errore' => {
    if (esito === '#' || esito === '+') return 'positivo';
    if (esito === '!' || esito === '-' || esito === '/') return 'negativo';
    if (esito === '=') return 'errore';
    return 'positivo'; // default
  };

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
    ? '📍 1/7 - Scegli la zona di provenienza della battuta'
    : step === 2
      ? '🏐 2/7 - Scegli il tipo di battuta'
      : step === 3
        ? '👆 3/7 - Tocca il giocatore che riceve'
        : step === 4
          ? '🤲 4/7 - Scegli il fondamentale usato'
          : step === 5
            ? '🎯 5/7 - Dove ha colpito la palla?'
            : step === 6
              ? '✅ 6/7 - Scegli l\'esito della ricezione'
              : '⚡ 7/7 - Velocità (opzionale)';

  const goBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }
  };

  const skipSpeed = () => {
    if (step === 7) {
      saveReception();
    }
  };

  // NUOVO: Funzione per importare dati da file Excel nell'app principale
  const handleImportData = (ricezioniImportate: any[]) => {
    // Estrai i nomi unici dei giocatori dalle ricezioni importate
    const nomiGiocatoriUnici: string[] = [];
    const nameToIndex: Record<string, number> = {};
    
    // Prima pass: raccogli tutti i nomi unici e assegna un indice a ciascuno
    ricezioniImportate.forEach(r => {
      const name = r.playerName;
      
      if (name && !nomiGiocatoriUnici.includes(name)) {
        const newIndex = nomiGiocatoriUnici.length;
        nomiGiocatoriUnici.push(name);
        nameToIndex[name] = newIndex;
      }
    });
    
    // Se ci sono nomi di giocatori, aggiorna l'array players
    if (nomiGiocatoriUnici.length > 0) {
      const nuoviPlayers: Player[] = [];
      
      // Crea un giocatore per ogni nome unico trovato
      nomiGiocatoriUnici.forEach((nome, index) => {
        const existingPlayer = players[index];
        
        nuoviPlayers.push({
          id: index + 1,
          name: nome,
          zone: existingPlayer?.zone || (index < 3 ? [5, 6, 1][index] : 5), // Zona di default per i primi 3
        });
      });
      
      setPlayers(nuoviPlayers);
      setPlayerCount(nuoviPlayers.length);
      setTempCount(nuoviPlayers.length);
      
      // Salva in localStorage
      saveJSON('vb_players', nuoviPlayers);
      saveJSON('vb_count', nuoviPlayers.length);
      
      // Seconda pass: aggiorna i playerIndex nelle ricezioni importate
      // per farli corrispondere ai nuovi indici dei giocatori
      const ricezioniAggiornate = ricezioniImportate.map(r => {
        const oldName = r.playerName;
        const newIndex = nameToIndex[oldName];
        
        return {
          ...r,
          playerIndex: newIndex !== undefined ? newIndex : r.playerIndex,
        };
      });
      
      // Aggiungi le ricezioni aggiornate a quelle esistenti
      setReceptions(prev => [...prev, ...ricezioniAggiornate]);
    } else {
      // Se non ci sono nomi, importa solo le ricezioni
      setReceptions(prev => [...prev, ...ricezioniImportate]);
    }
  };

  return (
    <SoglieProvider>
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ background: '#1e40af', color: '#fff', padding: '16px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>🏐 Scouting Ricezione</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}>Analisi della ricezione nella pallavolo</p>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
          📅 {currentTime}
        </p>
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

        {/* Barra di Progresso */}
        {step > 0 && step <= 7 && (
          <section style={{ ...cardStyle, padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5, 6, 7].map(s => (
                <div
                  key={s}
                  style={{
                    width: 'clamp(30px, 8vw, 40px)',
                    height: 'clamp(30px, 8vw, 40px)',
                    borderRadius: '50%',
                    background: s === step ? '#2563eb' : s < step ? '#22c55e' : '#e5e7eb',
                    color: s <= step ? '#fff' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    transition: 'all 0.2s',
                  }}
                >
                  {s < step ? '✓' : s}
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#6b7280' }}>
              Step {step} di 7
            </p>
          </section>
        )}

        {step === 1 && (
          <section style={cardStyle}>
            <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>📍 Zona di Provenienza della Battuta</h3>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                ← Indietro
              </button>
              <h3 style={{ margin: 0, color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>🏐 Tipo di Battuta</h3>
              <div style={{ width: '80px' }} />
            </div>
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
          {step === 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                ← Indietro
              </button>
              <h2 style={{ margin: 0, color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>👆 Campo da Gioco</h2>
              <div style={{ width: '80px' }} />
            </div>
          )}
          {step !== 3 && (
            <h2 style={{ textAlign: 'center', margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Campo da Gioco</h2>
          )}
          
          {/* NUOVO: Campo con giocatori spostabili liberamente */}
          <CampoGiocatoriLiberi
            giocatori={players}
            giocatoreSelezionato={selectedPlayerIdx}
            onPlayerClick={step === 3 ? selectPlayer : undefined}
          />
          
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', color: '#6b7280', fontStyle: 'italic' }}>{guideMsg}</p>
        </section>

        {step === 4 && (
          <section style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                ← Indietro
              </button>
              <h3 style={{ margin: 0, color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>🤲 Fondamentale</h3>
              <div style={{ width: '80px' }} />
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                ← Indietro
              </button>
              <h3 style={{ margin: 0, color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>🎯 Dove ha colpito?</h3>
              <div style={{ width: '80px' }} />
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                ← Indietro
              </button>
              <h3 style={{ margin: 0, color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>✅ Esito</h3>
              <div style={{ width: '80px' }} />
            </div>
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

        {step === 7 && (
          <section style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                ← Indietro
              </button>
              <h3 style={{ margin: 0, color: '#374151', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>⚡ Velocità</h3>
              <button
                onClick={skipSpeed}
                style={{
                  padding: '8px 16px',
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                }}
              >
                Salta →
              </button>
            </div>
            <p style={{ textAlign: 'center', margin: '0 0 16px', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', color: '#6b7280' }}>
              Inserisci la velocità se conosciuta, altrimenti premi "Salva" o "Salta"
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min="0"
                max="200"
                placeholder="es. 85"
                value={speedInput}
                onChange={(e) => setSpeedInput(e.target.value)}
                style={{
                  width: 'clamp(150px, 40vw, 200px)',
                  padding: '12px',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    saveReception();
                  }}
                  style={{
                    padding: 'clamp(10px, 3vw, 12px) clamp(20px, 5vw, 24px)',
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  ✓ Salva
                </button>
                <button
                  onClick={() => {
                    setSpeedInput('');
                    setSelectedSpeed(null);
                  }}
                  style={{
                    padding: 'clamp(10px, 3vw, 12px) clamp(20px, 5vw, 24px)',
                    background: '#9ca3af',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                  }}
                >
                  ↺ Svuota
                </button>
                <button
                  onClick={() => {
                    // Reset completo dell'inserimento
                    setSelectedPlayerIdx(null);
                    setSelectedServeType(null);
                    setSelectedServeZone(null);
                    setSelectedFundamental(null);
                    setSelectedDir(null);
                    setSelectedOutcome(null);
                    setSelectedSpeed(null);
                    setSpeedInput('');
                    setStep(1);
                  }}
                  style={{
                    padding: 'clamp(10px, 3vw, 12px) clamp(20px, 5vw, 24px)',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                  }}
                >
                  ✗ Annulla
                </button>
              </div>
            </div>
          </section>
        )}

        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 12px', color: '#374151', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Comandi</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button onClick={undoLast} disabled={receptions.length === 0} style={{ ...btnStyle('#eab308'), opacity: receptions.length === 0 ? 0.4 : 1 }}>↩️ Annulla ultimo</button>
            <button onClick={resetAll} style={btnStyle('#dc2626')}>🗑️ Azzera dati</button>
            <button onClick={exportCSV} disabled={receptions.length === 0} style={{ ...btnStyle('#16a34a'), opacity: receptions.length === 0 ? 0.4 : 1 }}>📊 Esporta CSV</button>
            <button onClick={exportExcel} disabled={receptions.length === 0} style={{ ...btnStyle('#2563eb'), opacity: receptions.length === 0 ? 0.4 : 1 }}>📈 Esporta Excel</button>
            <button onClick={handlePrint} style={btnStyle('#6b7280')}>🖨️ Stampa</button>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>Ricezioni registrate: <strong>{receptions.length}</strong></p>
        </section>

        {/* NUOVO - Pannello Configurazione Soglie Globali (Accordion) */}
        <ConfigSoglieUI />

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
                    <th style={thStyle}>Velocità</th>
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
                        <td style={tdStyle}>{players[r.playerIndex]?.name || r.playerName}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>Z{r.zone}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{fundInfo?.emoji} {r.fundamental}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{dirInfo?.symbol}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: outInfo?.bg, color: outInfo?.fg, fontWeight: 700 }}>
                            {r.outcome}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          {r.speed !== null && r.speed !== undefined ? `${r.speed} km/h` : '–'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => startEditReception(r)}
                              style={{
                                padding: '4px 10px',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              ✏️ Modifica
                            </button>
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
                              🗑️ Annulla
                            </button>
                          </div>
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
                        <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(counts[o.key], total, getTipoEsito(o.key)) }}>
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
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(c, receptions.length, getTipoEsito(o.key)) }}>
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
                        <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', background: getHighlightBg(counts[d.key], total) }}>
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
                      <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', background: getHighlightBg(counts[d.key], total) }}>
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
                        <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(counts[o.key], total) }}>
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
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(c, total) }}>
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
                        <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(counts[o.key], total) }}>
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
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(c, total) }}>
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
                        <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', background: getHighlightBg(counts[d.key], total) }}>
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
                      <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', background: getHighlightBg(counts[d.key], total) }}>
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
                        <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', background: getHighlightBg(counts[d.key], total) }}>
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
                      <td key={`${side}-${d.key}`} style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', background: getHighlightBg(counts[d.key], total) }}>
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
                          <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(counts[o.key], total) }}>
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
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(c, receptions.length) }}>
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
                          <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(counts[o.key], total) }}>
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
                      <td key={o.key} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(c, receptions.length) }}>
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
                        <td key={sz.zone} style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(count, total) }}>
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

        {/* NUOVO: Resoconto Analisi Completa */}
        <ResocontoAnalisi giocatori={players} colpi={receptions} />

        {/* NUOVO: Tabella Analisi Incrociata */}
        <TabellaAnalisiIncrociata giocatori={players} colpi={receptions} />

        {/* NUOVO: Tabella Direzione × Esito per Lato */}
        <TabellaDirezioneEsito giocatori={players} colpi={receptions} />

        {/* NUOVO: Analisi Multi-Giornata */}
        <AnalisiMultipla onImportData={handleImportData} />

        {/* NUOVO: Modal Modifica Ricezione */}
        {editingReception && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}>
              <h2 style={{ margin: '0 0 20px', color: '#1e40af', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>
                ✏️ Modifica Ricezione
              </h2>

              {/* Zona Battuta */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  📍 Zona di Provenienza Battuta
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SERVE_ZONES.map(sz => (
                    <button
                      key={sz.zone}
                      onClick={() => setEditForm(prev => ({ ...prev, serveZone: sz.zone }))}
                      style={{
                        padding: '10px 16px',
                        background: editForm.serveZone === sz.zone ? '#2563eb' : '#f3f4f6',
                        color: editForm.serveZone === sz.zone ? '#fff' : '#374151',
                        border: editForm.serveZone === sz.zone ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo Battuta */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  🏐 Tipo di Battuta
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SERVE_TYPES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setEditForm(prev => ({ ...prev, serveType: s.key }))}
                      style={{
                        padding: '10px 16px',
                        background: editForm.serveType === s.key ? '#2563eb' : '#f3f4f6',
                        color: editForm.serveType === s.key ? '#fff' : '#374151',
                        border: editForm.serveType === s.key ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Giocatore */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  👤 Giocatore
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {players.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditForm(prev => ({ ...prev, playerIndex: idx }))}
                      style={{
                        padding: '10px 16px',
                        background: editForm.playerIndex === idx ? '#2563eb' : '#f3f4f6',
                        color: editForm.playerIndex === idx ? '#fff' : '#374151',
                        border: editForm.playerIndex === idx ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fondamentale */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  🤲 Fondamentale
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {FUNDAMENTALS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setEditForm(prev => ({ ...prev, fundamental: f.key }))}
                      style={{
                        padding: '10px 16px',
                        background: editForm.fundamental === f.key ? '#2563eb' : '#f3f4f6',
                        color: editForm.fundamental === f.key ? '#fff' : '#374151',
                        border: editForm.fundamental === f.key ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direzione */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  🎯 Dove ha colpito la palla
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
                  <div />
                  <button
                    onClick={() => setEditForm(prev => ({ ...prev, direction: 'up' }))}
                    style={{
                      padding: '12px',
                      background: editForm.direction === 'up' ? '#2563eb' : '#f3f4f6',
                      color: editForm.direction === 'up' ? '#fff' : '#374151',
                      border: editForm.direction === 'up' ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    ▲
                  </button>
                  <div />
                  <button
                    onClick={() => setEditForm(prev => ({ ...prev, direction: 'left' }))}
                    style={{
                      padding: '12px',
                      background: editForm.direction === 'left' ? '#2563eb' : '#f3f4f6',
                      color: editForm.direction === 'left' ? '#fff' : '#374151',
                      border: editForm.direction === 'left' ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setEditForm(prev => ({ ...prev, direction: 'center' }))}
                    style={{
                      padding: '12px',
                      background: editForm.direction === 'center' ? '#2563eb' : '#f3f4f6',
                      color: editForm.direction === 'center' ? '#fff' : '#374151',
                      border: editForm.direction === 'center' ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    ●
                  </button>
                  <button
                    onClick={() => setEditForm(prev => ({ ...prev, direction: 'right' }))}
                    style={{
                      padding: '12px',
                      background: editForm.direction === 'right' ? '#2563eb' : '#f3f4f6',
                      color: editForm.direction === 'right' ? '#fff' : '#374151',
                      border: editForm.direction === 'right' ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    ▶
                  </button>
                  <div />
                  <button
                    onClick={() => setEditForm(prev => ({ ...prev, direction: 'down' }))}
                    style={{
                      padding: '12px',
                      background: editForm.direction === 'down' ? '#2563eb' : '#f3f4f6',
                      color: editForm.direction === 'down' ? '#fff' : '#374151',
                      border: editForm.direction === 'down' ? '2px solid #1d4ed8' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    ▼
                  </button>
                  <div />
                </div>
              </div>

              {/* Esito */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  ✅ Esito della Ricezione
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {OUTCOMES.map(o => (
                    <button
                      key={o.key}
                      onClick={() => setEditForm(prev => ({ ...prev, outcome: o.key }))}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: o.bg,
                        color: o.fg,
                        border: editForm.outcome === o.key ? '3px solid #1e40af' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      {o.key}
                      <span style={{ fontSize: '9px', fontWeight: 400, marginTop: '2px' }}>{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Velocità */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  ⚡ Velocità (km/h) - Opzionale
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  placeholder="es. 85"
                  value={editForm.speed !== null && editForm.speed !== undefined ? editForm.speed : ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    setEditForm(prev => ({ ...prev, speed: isNaN(val as number) ? null : val }));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '1rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
              </div>

              {/* Pulsanti */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={cancelEditReception}
                  style={{
                    padding: '12px 24px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  ❌ Annulla
                </button>
                <button
                  onClick={saveEditReception}
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  💾 Salva Modifiche
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </SoglieProvider>
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
