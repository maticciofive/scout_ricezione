/**
 * Componente UI per configurare le soglie globali
 * NUOVO FILE - Pannello Impostazioni
 */

import React, { useState, useEffect } from 'react';
import { useSoglie } from '../context/SoglieContext';
import { SoglieConfig } from '../utils/configSoglie';
import './ConfigSoglieUI.css';

export default function ConfigSoglieUI() {
  const { soglie, aggiornaSoglie, resettaSoglie } = useSoglie();
  const [soglieLocali, setSoglieLocali] = useState<SoglieConfig>(soglie);
  const [errori, setErrori] = useState<string[]>([]);
  const [espanso, setEspanso] = useState(false); // NUOVO - Stato per accordion
  const [attivato, setAttivato] = useState(true); // NUOVO - Stato per attivare/disattivare visualizzazione

  // Aggiorna lo stato locale quando le soglie globali cambiano
  useEffect(() => {
    setSoglieLocali(soglie);
  }, [soglie]);

  /**
   * Valida le soglie prima di salvarle
   */
  const validaSoglie = (config: SoglieConfig): string[] => {
    const errori: string[] = [];

    // Positivi: verde deve essere > arancione
    if (config.positivi.verde <= config.positivi.arancione) {
      errori.push('Positivi: la soglia verde deve essere maggiore dell\'arancione');
    }

    // Negativi: verde deve essere < arancione
    if (config.negativi.verde >= config.negativi.arancione) {
      errori.push('Negativi: la soglia verde deve essere minore dell\'arancione');
    }

    // Errori: verde deve essere < arancione
    if (config.errori.verde >= config.errori.arancione) {
      errori.push('Errori: la soglia verde deve essere minore dell\'arancione');
    }

    // Validazione range 0-100
    const tutteSoglie = [
      config.positivi.verde, config.positivi.arancione,
      config.negativi.verde, config.negativi.arancione,
      config.errori.verde, config.errori.arancione
    ];

    if (tutteSoglie.some(s => s < 0 || s > 100)) {
      errori.push('Tutte le soglie devono essere tra 0 e 100');
    }

    return errori;
  };

  /**
   * Gestisce il cambiamento di un valore
   */
  const handleChange = (
    categoria: 'positivi' | 'negativi' | 'errori',
    livello: 'verde' | 'arancione',
    valore: string
  ) => {
    const numValore = parseInt(valore) || 0;
    
    setSoglieLocali(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [livello]: numValore
      }
    }));
  };

  /**
   * Salva le soglie dopo validazione
   */
  const handleSalva = () => {
    const erroriValidazione = validaSoglie(soglieLocali);
    
    if (erroriValidazione.length > 0) {
      setErrori(erroriValidazione);
      return;
    }

    setErrori([]);
    aggiornaSoglie(soglieLocali);
    alert('✅ Soglie salvate con successo! Le modifiche saranno applicate immediatamente a tutte le tabelle.');
  };

  /**
   * Resetta alle soglie di default
   */
  const handleReset = () => {
    resettaSoglie();
    setErrori([]);
  };

  return (
    <div className="config-soglie-container">
      <div className="config-soglie-header">
        <div className="config-soglie-header-left">
          <h2 className="config-soglie-titolo">⚙️ Configurazione Soglie Globali</h2>
          <p className="config-soglie-descrizione">
            Queste soglie si applicano a tutte le analisi e tabelle dell'applicazione
          </p>
        </div>
        <div className="config-soglie-header-right">
          <label className="config-soglie-toggle-attivazione">
            <input
              type="checkbox"
              checked={attivato}
              onChange={(e) => setAttivato(e.target.checked)}
              className="config-soglie-checkbox"
            />
            <span>Attiva evidenziazione</span>
          </label>
          <button
            onClick={() => setEspanso(!espanso)}
            className="config-soglie-accordion-btn"
          >
            {espanso ? '▲ Nascondi' : '▼ Mostra'}
          </button>
        </div>
      </div>

      {espanso && (
        <>
          {errori.length > 0 && (
            <div className="config-soglie-errori">
              <strong>⚠️ Errori di validazione:</strong>
              <ul>
                {errori.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="config-soglie-grid">
        {/* Sezione Positivi */}
        <div className="config-soglie-sezione">
          <h3 className="config-soglie-sezione-titolo">
            🟢 Ricezioni Positive (# +)
          </h3>
          <p className="config-soglie-sezione-descrizione">
            Più alto è meglio
          </p>
          
          <div className="config-soglie-input-group">
            <label>
              Verde (≥):
              <input
                type="number"
                min="0"
                max="100"
                value={soglieLocali.positivi.verde}
                onChange={(e) => handleChange('positivi', 'verde', e.target.value)}
                className="config-soglie-input"
              />
              %
            </label>
          </div>

          <div className="config-soglie-input-group">
            <label>
              Arancione (≥):
              <input
                type="number"
                min="0"
                max="100"
                value={soglieLocali.positivi.arancione}
                onChange={(e) => handleChange('positivi', 'arancione', e.target.value)}
                className="config-soglie-input"
              />
              %
            </label>
          </div>

          <div className="config-soglie-anteprima">
            <div className="config-soglie-anteprima-item verde">
              ≥ {soglieLocali.positivi.verde}%
            </div>
            <div className="config-soglie-anteprima-item arancione">
              ≥ {soglieLocali.positivi.arancione}% e &lt; {soglieLocali.positivi.verde}%
            </div>
            <div className="config-soglie-anteprima-item rosso">
              &lt; {soglieLocali.positivi.arancione}%
            </div>
          </div>
        </div>

        {/* Sezione Negativi */}
        <div className="config-soglie-sezione">
          <h3 className="config-soglie-sezione-titolo">
            🟡 Ricezioni Negative (!, -, /)
          </h3>
          <p className="config-soglie-sezione-descrizione">
            Più basso è meglio
          </p>
          
          <div className="config-soglie-input-group">
            <label>
              Verde (≤):
              <input
                type="number"
                min="0"
                max="100"
                value={soglieLocali.negativi.verde}
                onChange={(e) => handleChange('negativi', 'verde', e.target.value)}
                className="config-soglie-input"
              />
              %
            </label>
          </div>

          <div className="config-soglie-input-group">
            <label>
              Arancione (≤):
              <input
                type="number"
                min="0"
                max="100"
                value={soglieLocali.negativi.arancione}
                onChange={(e) => handleChange('negativi', 'arancione', e.target.value)}
                className="config-soglie-input"
              />
              %
            </label>
          </div>

          <div className="config-soglie-anteprima">
            <div className="config-soglie-anteprima-item verde">
              ≤ {soglieLocali.negativi.verde}%
            </div>
            <div className="config-soglie-anteprima-item arancione">
              ≤ {soglieLocali.negativi.arancione}% e &gt; {soglieLocali.negativi.verde}%
            </div>
            <div className="config-soglie-anteprima-item rosso">
              &gt; {soglieLocali.negativi.arancione}%
            </div>
          </div>
        </div>

        {/* Sezione Errori */}
        <div className="config-soglie-sezione">
          <h3 className="config-soglie-sezione-titolo">
            🔴 Errori (=)
          </h3>
          <p className="config-soglie-sezione-descrizione">
            Più basso è meglio
          </p>
          
          <div className="config-soglie-input-group">
            <label>
              Verde (≤):
              <input
                type="number"
                min="0"
                max="100"
                value={soglieLocali.errori.verde}
                onChange={(e) => handleChange('errori', 'verde', e.target.value)}
                className="config-soglie-input"
              />
              %
            </label>
          </div>

          <div className="config-soglie-input-group">
            <label>
              Arancione (≤):
              <input
                type="number"
                min="0"
                max="100"
                value={soglieLocali.errori.arancione}
                onChange={(e) => handleChange('errori', 'arancione', e.target.value)}
                className="config-soglie-input"
              />
              %
            </label>
          </div>

          <div className="config-soglie-anteprima">
            <div className="config-soglie-anteprima-item verde">
              ≤ {soglieLocali.errori.verde}%
            </div>
            <div className="config-soglie-anteprima-item arancione">
              ≤ {soglieLocali.errori.arancione}% e &gt; {soglieLocali.errori.verde}%
            </div>
            <div className="config-soglie-anteprima-item rosso">
              &gt; {soglieLocali.errori.arancione}%
            </div>
          </div>
        </div>
      </div>

          <div className="config-soglie-bottoni">
            <button onClick={handleSalva} className="config-soglie-btn salva">
              💾 Salva Configurazione
            </button>
            <button onClick={handleReset} className="config-soglie-btn reset">
              🔄 Reset Default
            </button>
          </div>
        </>
      )}
    </div>
  );
}
