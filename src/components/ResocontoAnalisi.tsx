import React, { useState } from 'react';
import { generaAnalisiCompleta, AnalisiGiocatore } from '../utils/analisi';
// FIX DISTINZIONE ESITI: Import di getLatoDaZona per precisione spaziale
import { emojiPerClassifica, colorePerClassifica, getLatoDaZona } from '../utils/metriche';
import { esportaResoconto } from '../utils/exportResoconto';
import './ResocontoAnalisi.css';

interface Colpo {
  playerIndex: number;
  outcome: string;
  side?: string;
  direction?: string;
  serveZone?: number;
  speedCategory?: string;
  serveTypology?: string;
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

  const analisiList: AnalisiGiocatore[] = giocatori.map(g => 
    generaAnalisiCompleta(g.id, g.name, colpi)
  );

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
                        {analisi.puntiDeboli.direzioneCritica && <li>Direzione critica: {analisi.puntiDeboli.direzioneCritica}</li>}
                        {analisi.puntiDeboli.provenienzaCritica && <li>Provenienza critica: {analisi.puntiDeboli.provenienzaCritica}</li>}
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
