import React, { useState } from 'react';
import { generaAnalisiCompleta, AnalisiGiocatore } from '../utils/analisi';
import { emojiPerClassifica, colorePerClassifica } from '../utils/metriche';
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
                    <div className="resoconto-stat-inline">
                      <span>Errori: {analisi.metricheGlobali.pe.toFixed(1)}%</span>
                      <span>Negativi: {analisi.metricheGlobali.pn.toFixed(1)}%</span>
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
                      <h4>✅ Punti di Forza</h4>
                      <ul>
                        {analisi.puntiDiForza.migliorEsito && <li>Miglior esito: {analisi.puntiDiForza.migliorEsito}</li>}
                        {analisi.puntiDiForza.migliorZona && <li>Miglior zona: {analisi.puntiDiForza.migliorZona}</li>}
                        {analisi.puntiDiForza.migliorDirezione && <li>Miglior direzione: {analisi.puntiDiForza.migliorDirezione}</li>}
                        {analisi.puntiDiForza.migliorProvenienza && <li>Miglior provenienza: {analisi.puntiDiForza.migliorProvenienza}</li>}
                        {analisi.puntiDiForza.migliorVelocita && <li>Miglior velocità: {analisi.puntiDiForza.migliorVelocita}</li>}
                        {analisi.puntiDiForza.migliorTipologia && <li>Miglior tipologia: {analisi.puntiDiForza.migliorTipologia}</li>}
                        {analisi.puntiDiForza.combinazioneMigliore && <li>Combinazione migliore: {analisi.puntiDiForza.combinazioneMigliore}</li>}
                      </ul>
                    </div>
                    <div className="resoconto-colonna-debolezza">
                      <h4>⚠️ Su cui Lavorare</h4>
                      <ul>
                        {analisi.puntiDeboli.esitoNegativoPrevalente && <li>Esito negativo prevalente: {analisi.puntiDeboli.esitoNegativoPrevalente}</li>}
                        {analisi.puntiDeboli.zonaCritica && <li>Zona critica: {analisi.puntiDeboli.zonaCritica}</li>}
                        {analisi.puntiDeboli.direzioneCritica && <li>Direzione critica: {analisi.puntiDeboli.direzioneCritica}</li>}
                        {analisi.puntiDeboli.provenienzaCritica && <li>Provenienza critica: {analisi.puntiDeboli.provenienzaCritica}</li>}
                        {analisi.puntiDeboli.velocitaCritica && <li>Velocità critica: {analisi.puntiDeboli.velocitaCritica}</li>}
                        {analisi.puntiDeboli.tipologiaCritica && <li>Tipologia critica: {analisi.puntiDeboli.tipologiaCritica}</li>}
                        {analisi.puntiDeboli.combinazionePeggiore && <li>Combinazione peggiore: {analisi.puntiDeboli.combinazionePeggiore}</li>}
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
