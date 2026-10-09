import React, { useState } from 'react';
import { generaAnalisiCompleta, AnalisiGiocatore } from '../utils/analisi';
// FIX DISTINZIONE ESITI: Import di getLatoDaZona per precisione spaziale
import { emojiPerClassifica, colorePerClassifica, getLatoDaZona } from '../utils/metriche';
import { esportaResoconto } from '../utils/exportResoconto';
import './ResocontoAnalisi.css';

// Funzioni helper per etichette descrittive
function getDirezioneLabel(direzione: string): string {
  const direzioni: Record<string, string> = {
    'up': 'avanti',
    'down': 'dietro',
    'left': 'lato sinistro',
    'right': 'lato destro',
    'center': 'al corpo',
    'Davanti al corpo': 'avanti',
    'A sinistra del corpo': 'lato sinistro',
    'Al corpo': 'al corpo',
    'A destra del corpo': 'lato destro',
    'Dietro al corpo': 'dietro',
  };
  return direzioni[direzione] || direzione;
}

function getProvenienzaLabel(provenienza: string): string {
  if (provenienza.startsWith('Zona ')) {
    return `da ${provenienza.toLowerCase()}`;
  }
  if (provenienza.match(/^\d+$/)) {
    return `da zona ${provenienza}`;
  }
  return provenienza;
}

interface Colpo {
  playerIndex: number;
  outcome: string;
  side?: string;
  direction?: string;
  serveZone?: number;
  speedCategory?: string;
  serveTypology?: string;
  speed?: number | null;
}

interface Giocatore {
  id: number;
  name: string;
}

interface ResocontoAnalisiProps {
  giocatori: Giocatore[];
  colpi: Colpo[];
}

export default function ResocontoAnalisi({ giocatori, colpi }: ResocontoAnalisiProps) {
  const [mostraResoconto, setMostraResoconto] = useState(false);

  // FIX MAPPING ID: Usa l'indice dell'array, non l'ID del giocatore
  // I colpi salvati hanno playerIndex (0, 1, 2...) non player.id (1, 2, 3...)
  const analisiList: AnalisiGiocatore[] = giocatori.map((g, index) => 
    generaAnalisiCompleta(index, g.name, colpi)
  );

  // Calcola statistiche velocità per ogni giocatore
  const statisticheVelocita = giocatori.map((g, index) => {
    const colpiGiocatore = colpi.filter(c => c.playerIndex === index && c.speed !== null && c.speed !== undefined);
    if (colpiGiocatore.length === 0) return null;
    
    const velocitaValues = colpiGiocatore.map(c => c.speed as number);
    const velocitaMedia = velocitaValues.reduce((a, b) => a + b, 0) / velocitaValues.length;
    const velocitaMin = Math.min(...velocitaValues);
    const velocitaMax = Math.max(...velocitaValues);
    
    return {
      totale: colpiGiocatore.length,
      media: velocitaMedia,
      min: velocitaMin,
      max: velocitaMax,
    };
  });

  const handleEsporta = () => {
    esportaResoconto(analisiList);
  };

  return (
    <div className="resoconto-container">
      <div className="resoconto-header">
        <h2 className="resoconto-titolo">📊 Resoconto Analisi Completa</h2>
        <button
          className="resoconto-toggle-btn"
          onClick={() => setMostraResoconto(!mostraResoconto)}
        >
          {mostraResoconto ? '🔼 Nascondi' : '🔽 Mostra Resoconto'}
        </button>
        {mostraResoconto && (
          <button
            className="resoconto-export-btn"
            onClick={handleEsporta}
          >
            📥 Esporta Resoconto
          </button>
        )}
      </div>

      {mostraResoconto && (
        <div className="resoconto-content">
          {analisiList.map((analisi, idx) => (
            <div key={idx} className="resoconto-card">
              {analisi.datiInsufficienti ? (
                <div className="resoconto-insufficiente">
                  <h3>{analisi.giocatoreNome}</h3>
                  <p>⚠️ Dati insufficienti per un'analisi significativa</p>
                  <p className="resoconto-insufficiente-detail">
                    Totale colpi: {analisi.totaleColpi} (minimo richiesto: 5)
                  </p>
                </div>
              ) : (
                <>
                  {/* Header con metriche globali */}
                  <div className="resoconto-card-header">
                    <h3>{analisi.giocatoreNome}</h3>
                    <div className="resoconto-badge" style={{
                      backgroundColor: colorePerClassifica(analisi.metricheGlobali.classificaER)
                    }}>
                      {emojiPerClassifica(analisi.metricheGlobali.classificaER)} {analisi.metricheGlobali.classificaER.toUpperCase()}
                    </div>
                  </div>

                  <div className="resoconto-metriche-globali">
                    <div className="resoconto-stat">
                      <span className="resoconto-stat-label">Totale Colpi</span>
                      <span className="resoconto-stat-value">{analisi.totaleColpi}</span>
                    </div>
                    <div className="resoconto-stat">
                      <span className="resoconto-stat-label">PP (Percentuale Positiva)</span>
                      <div className="resoconto-barra-container">
                        <div 
                          className="resoconto-barra"
                          style={{
                            width: `${Math.min(analisi.metricheGlobali.pp, 100)}%`,
                            backgroundColor: analisi.metricheGlobali.pp >= 55 ? '#16a34a' : analisi.metricheGlobali.pp >= 45 ? '#ca8a04' : '#dc2626'
                          }}
                        />
                      </div>
                      <span className="resoconto-stat-value">{analisi.metricheGlobali.pp.toFixed(1)}%</span>
                    </div>
                    <div className="resoconto-stat">
                      <span className="resoconto-stat-label">ER (Efficienza)</span>
                      <div className="resoconto-barra-container">
                        <div 
                          className="resoconto-barra"
                          style={{
                            width: `${Math.min(Math.max(analisi.metricheGlobali.er, 0), 100)}%`,
                            backgroundColor: analisi.metricheGlobali.er >= 45 ? '#16a34a' : analisi.metricheGlobali.er >= 40 ? '#ca8a04' : '#dc2626'
                          }}
                        />
                      </div>
                      <span className="resoconto-stat-value">{analisi.metricheGlobali.er.toFixed(1)}%</span>
                    </div>
                    {/* FIX DISTINZIONE ESITI: Mostra separatamente Errori (=) e Negative (-) */}
                    <div className="resoconto-stat-inline">
                      <span 
                        style={{
                          // FIX DISTINZIONE ESITI: Evidenzia in rosso PE ≥ 15%
                          color: analisi.metricheGlobali.pe >= 15 ? '#dc2626' : 'inherit',
                          fontWeight: analisi.metricheGlobali.pe >= 15 ? 700 : 400
                        }}
                      >
                        Errori (=): {analisi.metricheGlobali.pe.toFixed(1)}%
                        {analisi.metricheGlobali.pe >= 15 && ' ⚠️'}
                      </span>
                      <span>Negative (-): {analisi.metricheGlobali.pn.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Analisi per Velocità */}
                  {analisi.perVelocita.some(v => v.totale > 0) && (
                    <div className="resoconto-sezione">
                      <h4>🏃 Analisi per Velocità</h4>
                      <table className="resoconto-tabella">
                        <thead>
                          <tr>
                            <th>Velocità</th>
                            <th>Colpi</th>
                            <th>PP</th>
                            <th>ER</th>
                            <th>Giudizio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analisi.perVelocita.map((v, i) => (
                            v.totale > 0 && (
                              <tr key={i}>
                                <td>{v.nome}</td>
                                <td>{v.totale}</td>
                                <td>{v.pp.toFixed(1)}%</td>
                                <td>{v.er.toFixed(1)}%</td>
                                <td>{emojiPerClassifica(v.classificaER)}</td>
                              </tr>
                            )
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Analisi per Tipologia */}
                  {analisi.perTipologia.some(t => t.totale > 0) && (
                    <div className="resoconto-sezione">
                      <h4>🎯 Analisi per Tipologia</h4>
                      <table className="resoconto-tabella">
                        <thead>
                          <tr>
                            <th>Tipologia</th>
                            <th>Colpi</th>
                            <th>PP</th>
                            <th>ER</th>
                            <th>Giudizio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analisi.perTipologia.map((t, i) => (
                            t.totale > 0 && (
                              <tr key={i}>
                                <td>{t.nome}</td>
                                <td>{t.totale}</td>
                                <td>{t.pp.toFixed(1)}%</td>
                                <td>{t.er.toFixed(1)}%</td>
                                <td>{emojiPerClassifica(t.classificaER)}</td>
                              </tr>
                            )
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Analisi Velocità del Servizio */}
                  {statisticheVelocita[idx] && (
                    <div className="resoconto-sezione">
                      <h4>⚡ Analisi Velocità del Servizio</h4>
                      <div className="resoconto-velocita-stats">
                        <div className="velocita-stat-item">
                          <span className="velocita-stat-label">Ricezioni con velocità:</span>
                          <span className="velocita-stat-value">{statisticheVelocita[idx]!.totale}</span>
                        </div>
                        <div className="velocita-stat-item">
                          <span className="velocita-stat-label">Velocità media:</span>
                          <span className="velocita-stat-value">{statisticheVelocita[idx]!.media.toFixed(1)} km/h</span>
                        </div>
                        <div className="velocita-stat-item">
                          <span className="velocita-stat-label">Range:</span>
                          <span className="velocita-stat-value">{statisticheVelocita[idx]!.min.toFixed(0)} - {statisticheVelocita[idx]!.max.toFixed(0)} km/h</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Punto di Ricezione per Lato - BAGHER */}
                  {analisi.perFondamentale.bagher.totale > 0 && (
                    <div className="resoconto-sezione">
                      <h4>🤲 Punto di Ricezione per Lato - BAGHER</h4>
                      <p className="resoconto-sezione-descrizione">
                        Totale bagher: <strong>{analisi.perFondamentale.bagher.totale}</strong> | 
                        Le 3 direzioni con più esecuzioni per ogni lato sono evidenziate
                      </p>
                      <table className="resoconto-tabella">
                        <thead>
                          <tr>
                            <th>Lato</th>
                            <th>▲ Avanti</th>
                            <th>◀ Sinistra</th>
                            <th>● Centro</th>
                            <th>▶ Destra</th>
                            <th>▼ Dietro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analisi.perFondamentale.bagher.perLato.map((latoData, i) => (
                            <tr key={i}>
                              <td><strong>{latoData.lato}</strong><br /><small>({latoData.totale} colpi)</small></td>
                              {latoData.direzioni.map((dir, j) => (
                                <td 
                                  key={j} 
                                  className={dir.isTop3 ? 'cella-top3' : ''}
                                  style={{
                                    backgroundColor: dir.isTop3 ? '#d1fae5' : 'transparent',
                                    fontWeight: dir.isTop3 ? 700 : 400,
                                  }}
                                >
                                  {dir.totale > 0 ? (
                                    <>
                                      <div>{dir.totale}</div>
                                      <small>{dir.percentuale.toFixed(1)}%</small>
                                    </>
                                  ) : (
                                    <span style={{ color: '#9ca3af' }}>–</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Punto di Ricezione per Lato - PALLEGGIO */}
                  {analisi.perFondamentale.palleggio.totale > 0 && (
                    <div className="resoconto-sezione">
                      <h4>👐 Punto di Ricezione per Lato - PALLEGGIO</h4>
                      <p className="resoconto-sezione-descrizione">
                        Totale palleggi: <strong>{analisi.perFondamentale.palleggio.totale}</strong> | 
                        Le 3 direzioni con più esecuzioni per ogni lato sono evidenziate
                      </p>
                      <table className="resoconto-tabella">
                        <thead>
                          <tr>
                            <th>Lato</th>
                            <th>▲ Avanti</th>
                            <th>◀ Sinistra</th>
                            <th>● Centro</th>
                            <th>▶ Destra</th>
                            <th>▼ Dietro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analisi.perFondamentale.palleggio.perLato.map((latoData, i) => (
                            <tr key={i}>
                              <td><strong>{latoData.lato}</strong><br /><small>({latoData.totale} colpi)</small></td>
                              {latoData.direzioni.map((dir, j) => (
                                <td 
                                  key={j} 
                                  className={dir.isTop3 ? 'cella-top3' : ''}
                                  style={{
                                    backgroundColor: dir.isTop3 ? '#dbeafe' : 'transparent',
                                    fontWeight: dir.isTop3 ? 700 : 400,
                                  }}
                                >
                                  {dir.totale > 0 ? (
                                    <>
                                      <div>{dir.totale}</div>
                                      <small>{dir.percentuale.toFixed(1)}%</small>
                                    </>
                                  ) : (
                                    <span style={{ color: '#9ca3af' }}>–</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Punti di forza e debolezze */}
                  <div className="resoconto-grid-due-colonne">
                    <div className="resoconto-colonna-forza">
                      <h4>✅ Punti di Forza (Evidenze Positive)</h4>
                      <ul>
                        {analisi.puntiDiForza.caratteristichePositivita && (
                          <li className="resoconto-evidenza-positiva">
                            <strong>Caratteristiche positività:</strong> {analisi.puntiDiForza.caratteristichePositivita}
                          </li>
                        )}
                        {analisi.puntiDiForza.migliorEsito && <li>Miglior esito: {analisi.puntiDiForza.migliorEsito}</li>}
                        {analisi.puntiDiForza.migliorZona && <li>Zona con più positività: {analisi.puntiDiForza.migliorZona}</li>}
                        {analisi.puntiDiForza.migliorDirezione && <li>Direzione con più positività: {analisi.puntiDiForza.migliorDirezione}</li>}
                        {analisi.puntiDiForza.migliorProvenienza && <li>Provenienza con più positività: {analisi.puntiDiForza.migliorProvenienza}</li>}
                        {analisi.puntiDiForza.migliorVelocita && <li>Velocità con più positività: {analisi.puntiDiForza.migliorVelocita}</li>}
                        {analisi.puntiDiForza.migliorTipologia && <li>Tipologia con più positività: {analisi.puntiDiForza.migliorTipologia}</li>}
                        {analisi.puntiDiForza.combinazioneMigliore && <li>Combinazione con più positività: {analisi.puntiDiForza.combinazioneMigliore}</li>}
                      </ul>
                    </div>
                    <div className="resoconto-colonna-debolezza">
                      <h4>⚠️ Criticità (Evidenze Negative)</h4>
                      <ul>
                        {analisi.puntiDeboli.caratteristicheNegativita && (
                          <li className="resoconto-evidenza-negativa">
                            <strong>Caratteristiche negatività:</strong> {analisi.puntiDeboli.caratteristicheNegativita}
                          </li>
                        )}
                        {analisi.puntiDeboli.esitoNegativoPrevalente && (
                          <li>
                            {/* FIX DISTINZIONE ESITI: Mostra separatamente Errori (=) e Negative (-) */}
                            Esito negativo prevalente: <strong>{analisi.puntiDeboli.esitoNegativoPrevalente}</strong>
                            {analisi.puntiDeboli.direzioneCritica && (
                              <span> - direzione: {getDirezioneLabel(analisi.puntiDeboli.direzioneCritica)}</span>
                            )}
                          </li>
                        )}
                        {analisi.puntiDeboli.zonaCritica && (
                          <li style={{
                            // FIX SPATIALE: Evidenzia in rosso se PE ≥ 15%
                            backgroundColor: analisi.metricheGlobali.pe >= 15 ? '#fee2e2' : 'transparent',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: analisi.metricheGlobali.pe >= 15 ? 700 : 400
                          }}>
                            {/* FIX SPATIALE: Usa getLatoDaZona per precisione spaziale */}
                            ⚠️ Zona {analisi.puntiDeboli.zonaCritica}: lavorare sul lato <strong>{getLatoDaZona(analisi.puntiDeboli.zonaCritica)}</strong>
                          </li>
                        )}
                        {analisi.puntiDeboli.direzioneCritica && (
                          <li>Direzione critica: <strong>{analisi.puntiDeboli.direzioneCritica}</strong> ({getDirezioneLabel(analisi.puntiDeboli.direzioneCritica)})</li>
                        )}
                        {analisi.puntiDeboli.provenienzaCritica && (
                          <li>Provenienza critica: <strong>{getProvenienzaLabel(analisi.puntiDeboli.provenienzaCritica)}</strong></li>
                        )}
                        {analisi.puntiDeboli.velocitaCritica && <li>Velocità critica: {analisi.puntiDeboli.velocitaCritica}</li>}
                        {analisi.puntiDeboli.tipologiaCritica && <li>Tipologia critica: {analisi.puntiDeboli.tipologiaCritica}</li>}
                        {analisi.puntiDeboli.combinazionePeggiore && <li>Combinazione critica: {analisi.puntiDeboli.combinazionePeggiore}</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Sintesi */}
                  <div className="resoconto-sintesi">
                    <h4>💡 Sintesi Analitica</h4>
                    <p>{analisi.sintesi}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
