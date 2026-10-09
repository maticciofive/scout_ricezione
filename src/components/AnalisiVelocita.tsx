import React, { useState, useMemo } from 'react';
import './AnalisiVelocita.css';

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
}

interface Player {
  id: number;
  name: string;
  zone: number;
}

interface AnalisiVelocitaProps {
  players: Player[];
  receptions: Reception[];
}

interface StatisticheVelocita {
  playerIndex: number;
  playerName: string;
  totaleRicezioni: number;
  ricezioniConVelocita: number;
  velocitaMedia: number;
  velocitaMin: number;
  velocitaMax: number;
  perRange: {
    lenta: { count: number; pp: number; er: number };
    media: { count: number; pp: number; er: number };
    veloce: { count: number; pp: number; er: number };
  };
  perEsito: Record<string, { count: number; velocitaMedia: number }>;
  perZona: Record<string, { count: number; velocitaMedia: number; pp: number }>;
  perLato: Record<string, { count: number; velocitaMedia: number; pp: number }>;
  difficolta: {
    velocitaCritica: string | null;
    provenienzaCritica: string | null;
    latoCritico: string | null;
  };
}

export default function AnalisiVelocita({ players, receptions }: AnalisiVelocitaProps) {
  const [sogliaMinima, setSogliaMinima] = useState<number>(5);
  const [playerFilter, setPlayerFilter] = useState<string>('all');

  // Calcola le statistiche della velocità per ogni giocatore
  const statisticheGiocatori = useMemo((): StatisticheVelocita[] => {
    return players.map((player, idx) => {
      const playerReceptions = receptions.filter(r => r.playerIndex === idx);
      const ricezioniConVelocita = playerReceptions.filter(r => r.speed !== null && r.speed !== undefined);
      
      if (ricezioniConVelocita.length < sogliaMinima) {
        return {
          playerIndex: idx,
          playerName: player.name,
          totaleRicezioni: playerReceptions.length,
          ricezioniConVelocita: ricezioniConVelocita.length,
          velocitaMedia: 0,
          velocitaMin: 0,
          velocitaMax: 0,
          perRange: {
            lenta: { count: 0, pp: 0, er: 0 },
            media: { count: 0, pp: 0, er: 0 },
            veloce: { count: 0, pp: 0, er: 0 },
          },
          perEsito: {},
          perZona: {},
          perLato: {},
          difficolta: {
            velocitaCritica: null,
            provenienzaCritica: null,
            latoCritico: null,
          },
        };
      }

      // Calcola statistiche base
      const velocitaValues = ricezioniConVelocita.map(r => r.speed as number);
      const velocitaMedia = velocitaValues.reduce((a, b) => a + b, 0) / velocitaValues.length;
      const velocitaMin = Math.min(...velocitaValues);
      const velocitaMax = Math.max(...velocitaValues);

      // Classifica per range di velocità
      const lenta = ricezioniConVelocita.filter(r => (r.speed as number) < 80);
      const media = ricezioniConVelocita.filter(r => (r.speed as number) >= 80 && (r.speed as number) < 100);
      const veloce = ricezioniConVelocita.filter(r => (r.speed as number) >= 100);

      const calcolaMetriche = (arr: Reception[]) => {
        if (arr.length === 0) return { count: 0, pp: 0, er: 0 };
        const positive = arr.filter(r => r.outcome === '#' || r.outcome === '+').length;
        const errors = arr.filter(r => r.outcome === '=').length;
        return {
          count: arr.length,
          pp: (positive / arr.length) * 100,
          er: ((positive - errors) / arr.length) * 100,
        };
      };

      const perRange = {
        lenta: calcolaMetriche(lenta),
        media: calcolaMetriche(media),
        veloce: calcolaMetriche(veloce),
      };

      // Analisi per esito
      const perEsito: Record<string, { count: number; velocitaMedia: number }> = {};
      ['#', '+', '!', '-', '/', '='].forEach(esito => {
        const ricezioniEsito = ricezioniConVelocita.filter(r => r.outcome === esito);
        if (ricezioniEsito.length > 0) {
          const velMedia = ricezioniEsito.reduce((sum, r) => sum + (r.speed as number), 0) / ricezioniEsito.length;
          perEsito[esito] = {
            count: ricezioniEsito.length,
            velocitaMedia: velMedia,
          };
        }
      });

      // Analisi per zona di provenienza
      const perZona: Record<string, { count: number; velocitaMedia: number; pp: number }> = {};
      [1, 5, 6].forEach(zona => {
        const ricezioniZona = ricezioniConVelocita.filter(r => r.serveZone === zona);
        if (ricezioniZona.length > 0) {
          const velMedia = ricezioniZona.reduce((sum, r) => sum + (r.speed as number), 0) / ricezioniZona.length;
          const positive = ricezioniZona.filter(r => r.outcome === '#' || r.outcome === '+').length;
          perZona[`Zona ${zona}`] = {
            count: ricezioniZona.length,
            velocitaMedia: velMedia,
            pp: (positive / ricezioniZona.length) * 100,
          };
        }
      });

      // Analisi per lato
      const perLato: Record<string, { count: number; velocitaMedia: number; pp: number }> = {};
      ['Sinistra', 'Centro', 'Destra'].forEach(lato => {
        const ricezioniLato = ricezioniConVelocita.filter(r => r.side === lato);
        if (ricezioniLato.length > 0) {
          const velMedia = ricezioniLato.reduce((sum, r) => sum + (r.speed as number), 0) / ricezioniLato.length;
          const positive = ricezioniLato.filter(r => r.outcome === '#' || r.outcome === '+').length;
          perLato[lato] = {
            count: ricezioniLato.length,
            velocitaMedia: velMedia,
            pp: (positive / ricezioniLato.length) * 100,
          };
        }
      });

      // Identifica difficoltà
      const difficolta = {
        velocitaCritica: perRange.lenta.pp < perRange.media.pp && perRange.lenta.pp < perRange.veloce.pp
          ? 'Lenta'
          : perRange.veloce.pp < perRange.media.pp && perRange.veloce.pp < perRange.lenta.pp
          ? 'Veloce'
          : perRange.media.pp < perRange.lenta.pp && perRange.media.pp < perRange.veloce.pp
          ? 'Media'
          : null,
        provenienzaCritica: Object.entries(perZona).reduce((min, [zona, stats]) => 
          stats.pp < (min ? perZona[min].pp : Infinity) ? zona : min, null as string | null),
        latoCritico: Object.entries(perLato).reduce((min, [lato, stats]) => 
          stats.pp < (min ? perLato[min].pp : Infinity) ? lato : min, null as string | null),
      };

      return {
        playerIndex: idx,
        playerName: player.name,
        totaleRicezioni: playerReceptions.length,
        ricezioniConVelocita: ricezioniConVelocita.length,
        velocitaMedia,
        velocitaMin,
        velocitaMax,
        perRange,
        perEsito,
        perZona,
        perLato,
        difficolta,
      };
    });
  }, [players, receptions, sogliaMinima]);

  const giocatoriFiltrati = playerFilter === 'all' 
    ? statisticheGiocatori.filter(s => s.ricezioniConVelocita >= sogliaMinima)
    : statisticheGiocatori.filter(s => s.playerIndex === parseInt(playerFilter) && s.ricezioniConVelocita >= sogliaMinima);

  return (
    <div className="analisi-velocita-container">
      <h2 className="analisi-velocita-title">⚡ Analisi Velocità del Servizio</h2>

      {/* Controlli */}
      <div className="analisi-velocita-controls">
        <div className="analisi-velocita-control-group">
          <label>Soglia Minima Ricezioni:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={sogliaMinima}
            onChange={(e) => setSogliaMinima(parseInt(e.target.value) || 5)}
            className="analisi-velocita-input"
          />
        </div>

        <div className="analisi-velocita-control-group">
          <label>Giocatore:</label>
          <select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)}>
            <option value="all">Tutti i giocatori</option>
            {players.map((p, idx) => (
              <option key={idx} value={idx}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info soglia */}
      <div className="analisi-velocita-info">
        <p>
          <strong>Nota:</strong> Vengono mostrati solo i giocatori con almeno <strong>{sogliaMinima}</strong> ricezioni con velocità registrata.
        </p>
      </div>

      {/* Analisi per giocatore */}
      {giocatoriFiltrati.length === 0 ? (
        <div className="analisi-velocita-empty">
          <p>Nessun giocatore ha abbastanza dati sulla velocità (minimo {sogliaMinima} ricezioni)</p>
        </div>
      ) : (
        giocatoriFiltrati.map((stats) => (
          <div key={stats.playerIndex} className="analisi-velocita-player">
            <h3 className="analisi-velocita-player-name">{stats.playerName}</h3>
            
            {/* Statistiche base */}
            <div className="analisi-velocita-stats-base">
              <div className="stat-item">
                <span className="stat-label">Ricezioni con velocità:</span>
                <span className="stat-value">{stats.ricezioniConVelocita} / {stats.totaleRicezioni}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Velocità media:</span>
                <span className="stat-value">{stats.velocitaMedia.toFixed(1)} km/h</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Range:</span>
                <span className="stat-value">{stats.velocitaMin.toFixed(0)} - {stats.velocitaMax.toFixed(0)} km/h</span>
              </div>
            </div>

            {/* Performance per range di velocità */}
            <div className="analisi-velocita-section">
              <h4>📊 Performance per Range di Velocità</h4>
              <div className="range-grid">
                <div className="range-item">
                  <div className="range-header">🐢 Lenta (&lt;80 km/h)</div>
                  <div className="range-stats">
                    <div>Ricezioni: <strong>{stats.perRange.lenta.count}</strong></div>
                    <div>PP: <strong>{stats.perRange.lenta.pp.toFixed(1)}%</strong></div>
                    <div>ER: <strong>{stats.perRange.lenta.er.toFixed(1)}%</strong></div>
                  </div>
                </div>
                <div className="range-item">
                  <div className="range-header">🚶 Media (80-100 km/h)</div>
                  <div className="range-stats">
                    <div>Ricezioni: <strong>{stats.perRange.media.count}</strong></div>
                    <div>PP: <strong>{stats.perRange.media.pp.toFixed(1)}%</strong></div>
                    <div>ER: <strong>{stats.perRange.media.er.toFixed(1)}%</strong></div>
                  </div>
                </div>
                <div className="range-item">
                  <div className="range-header">🏃 Veloce (≥100 km/h)</div>
                  <div className="range-stats">
                    <div>Ricezioni: <strong>{stats.perRange.veloce.count}</strong></div>
                    <div>PP: <strong>{stats.perRange.veloce.pp.toFixed(1)}%</strong></div>
                    <div>ER: <strong>{stats.perRange.veloce.er.toFixed(1)}%</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analisi per esito */}
            <div className="analisi-velocita-section">
              <h4>✅ Velocità Media per Esito</h4>
              <div className="esito-grid">
                {Object.entries(stats.perEsito).map(([esito, data]) => {
                  const esitoLabels: Record<string, string> = {
                    '#': 'Perfetta',
                    '+': 'Positiva',
                    '!': 'Esclamativa',
                    '-': 'Negativa',
                    '/': 'Slash',
                    '=': 'Errore',
                  };
                  return (
                    <div key={esito} className="esito-item">
                      <div className="esito-label">{esitoLabels[esito]} ({esito})</div>
                      <div className="esito-stats">
                        <div>Count: <strong>{data.count}</strong></div>
                        <div>Vel. media: <strong>{data.velocitaMedia.toFixed(1)} km/h</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analisi per zona di provenienza */}
            <div className="analisi-velocita-section">
              <h4>📍 Velocità per Zona di Provenienza</h4>
              <div className="zona-grid">
                {Object.entries(stats.perZona).map(([zona, data]) => (
                  <div key={zona} className="zona-item">
                    <div className="zona-label">{zona}</div>
                    <div className="zona-stats">
                      <div>Ricezioni: <strong>{data.count}</strong></div>
                      <div>Vel. media: <strong>{data.velocitaMedia.toFixed(1)} km/h</strong></div>
                      <div>PP: <strong>{data.pp.toFixed(1)}%</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analisi per lato */}
            <div className="analisi-velocita-section">
              <h4>🎯 Velocità per Lato di Ricezione</h4>
              <div className="lato-grid">
                {Object.entries(stats.perLato).map(([lato, data]) => (
                  <div key={lato} className="lato-item">
                    <div className="lato-label">{lato}</div>
                    <div className="lato-stats">
                      <div>Ricezioni: <strong>{data.count}</strong></div>
                      <div>Vel. media: <strong>{data.velocitaMedia.toFixed(1)} km/h</strong></div>
                      <div>PP: <strong>{data.pp.toFixed(1)}%</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficoltà identificate */}
            <div className="analisi-velocita-difficolta">
              <h4>⚠️ Difficoltà Identificate</h4>
              <div className="difficolta-content">
                {stats.difficolta.velocitaCritica && (
                  <div className="difficolta-item">
                    <strong>Velocità critica:</strong> Battute {stats.difficolta.velocitaCritica.toLowerCase()}
                  </div>
                )}
                {stats.difficolta.provenienzaCritica && (
                  <div className="difficolta-item">
                    <strong>Provenienza critica:</strong> {stats.difficolta.provenienzaCritica}
                  </div>
                )}
                {stats.difficolta.latoCritico && (
                  <div className="difficolta-item">
                    <strong>Lato critico:</strong> {stats.difficolta.latoCritico}
                  </div>
                )}
                {!stats.difficolta.velocitaCritica && !stats.difficolta.provenienzaCritica && !stats.difficolta.latoCritico && (
                  <div className="difficolta-item">
                    <em>Nessuna difficoltà significativa identificata</em>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
