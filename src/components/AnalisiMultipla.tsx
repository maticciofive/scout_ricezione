import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './AnalisiMultipla.css';

interface DatiRicezione {
  data: string;
  fileName: string;
  ricezioni: any[];
}

interface AnalisiGiornaliera {
  data: string;
  fileName: string;
  totale: number;
  pp: number;
  er: number;
  pe: number;
  pn: number;
  perfette: number;
  positive: number;
  esclamative: number;
  negative: number;
  slash: number;
  errori: number;
}

interface AnalisiMultiplaProps {
  onImportData?: (ricezioni: any[]) => void;
}

export default function AnalisiMultipla({ onImportData }: AnalisiMultiplaProps) {
  const [fileCaricati, setFileCaricati] = useState<DatiRicezione[]>([]);
  const [analisi, setAnalisi] = useState<AnalisiGiornaliera[]>([]);
  const [caricamento, setCaricamento] = useState(false);

  const estraiDataDaNomeFile = (fileName: string): string => {
    // Pattern: ricezioni_complete_YYYY-MM-DD.xls(x) o .csv
    const match = fileName.match(/ricezioni_complete_(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : 'Data sconosciuta';
  };

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(';').map(v => v.replace(/"/g, '').trim());
            const obj: any = {};
            headers.forEach((h, i) => {
              obj[h] = values[i];
            });
            return obj;
          });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setCaricamento(true);
    const nuoviFile: DatiRicezione[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = estraiDataDaNomeFile(file.name);
      
      try {
        let ricezioni: any[];
        if (file.name.endsWith('.csv')) {
          ricezioni = await parseCSVFile(file);
        } else {
          ricezioni = await parseExcelFile(file);
        }
        
        nuoviFile.push({
          data,
          fileName: file.name,
          ricezioni
        });
      } catch (error) {
        console.error(`Errore nel caricamento di ${file.name}:`, error);
        alert(`Errore nel caricamento del file ${file.name}`);
      }
    }

    setFileCaricati(prev => [...prev, ...nuoviFile]);
    setCaricamento(false);
    
    // Reset input
    event.target.value = '';
  };

  const calcolaAnalisi = () => {
    if (fileCaricati.length === 0) {
      alert('Carica almeno un file prima di calcolare l\'analisi');
      return;
    }

    const analisiCalcolata: AnalisiGiornaliera[] = fileCaricati.map(file => {
      const totale = file.ricezioni.length;
      
      const perfette = file.ricezioni.filter(r => r.Esito === '#' || r.Esito === 'Perfetta').length;
      const positive = file.ricezioni.filter(r => r.Esito === '+' || r.Esito === 'Positiva').length;
      const esclamative = file.ricezioni.filter(r => r.Esito === '!' || r.Esito === 'Esclamativa').length;
      const negative = file.ricezioni.filter(r => r.Esito === '-' || r.Esito === 'Negativa').length;
      const slash = file.ricezioni.filter(r => r.Esito === '/' || r.Esito === 'Slash').length;
      const errori = file.ricezioni.filter(r => r.Esito === '=' || r.Esito === 'Errore').length;

      const pp = totale > 0 ? ((perfette + positive) / totale) * 100 : 0;
      const er = totale > 0 ? ((perfette + positive - errori) / totale) * 100 : 0;
      const pe = totale > 0 ? (errori / totale) * 100 : 0;
      const pn = totale > 0 ? ((negative + slash) / totale) * 100 : 0;

      return {
        data: file.data,
        fileName: file.fileName,
        totale,
        pp,
        er,
        pe,
        pn,
        perfette,
        positive,
        esclamative,
        negative,
        slash,
        errori
      };
    });

    // Ordina per data (dal più vecchio al più recente)
    analisiCalcolata.sort((a, b) => {
      if (a.data === 'Data sconosciuta') return 1;
      if (b.data === 'Data sconosciuta') return -1;
      return a.data.localeCompare(b.data);
    });

    setAnalisi(analisiCalcolata);
  };

  const rimuoviFile = (index: number) => {
    setFileCaricati(prev => prev.filter((_, i) => i !== index));
    setAnalisi([]);
  };

  const resettaTutto = () => {
    setFileCaricati([]);
    setAnalisi([]);
  };

  const importaDatiNellApp = () => {
    if (fileCaricati.length === 0) {
      alert('Nessun file caricato da importare');
      return;
    }

    // Chiedi conferma all'utente
    const totaleRicezioni = fileCaricati.reduce((sum, file) => sum + file.ricezioni.length, 0);
    const conferma = window.confirm(
      `Vuoi importare ${totaleRicezioni} ricezioni da ${fileCaricati.length} file nell'app principale?\n\n` +
      `I dati verranno aggiunti alle ricezioni esistenti e potrai continuare il lavoro.`
    );

    if (!conferma) return;

    try {
      // Converti i dati dal formato Excel al formato dell'app
      const ricezioniImportate: any[] = [];
      let errori = 0;
      
      fileCaricati.forEach(file => {
        file.ricezioni.forEach((r: any, index: number) => {
          try {
            // Estrai i valori con gestione errori
            const giocatoreStr = r.Giocatore || r['Giocatore'] || '';
            const playerIndex = parseInt(giocatoreStr.replace('Giocatore ', '').replace('Player ', '')) - 1;
            const zone = parseInt(r.Zona || r['Zona'] || '0');
            const side = r.Lato || r['Lato'] || 'Centro';
            const serveType = r['Tipo Battuta'] || r['Tipo di Battuta'] || r['Serve Type'] || 'F';
            const serveZone = parseInt(r['Zona Battuta'] || r['Zona di Battuta'] || r['Serve Zone'] || '1');
            const fundamentalStr = r.Fondamentale || r['Fondamentale'] || 'Bagher';
            const directionStr = r['Punto di ricezione'] || r['Direzione'] || r['Direction'] || 'Al corpo';
            const outcome = r.Esito || r['Esito'] || r['Outcome'] || '+';
            const speedStr = r['Velocità (km/h)'] || r['Velocità'] || r['Speed'] || '';
            const timestamp = r['Data e ora'] || r['Data'] || r['Timestamp'] || new Date().toLocaleString('it-IT');

            // Converti fondamentale
            let fundamental = 'B';
            if (fundamentalStr === 'Palleggio' || fundamentalStr === 'P' || fundamentalStr === 'Palleggio (mani)') {
              fundamental = 'P';
            }

            // Converti direzione
            let direction = 'center';
            if (directionStr === 'Davanti al corpo' || directionStr === 'Davanti' || directionStr === '▲') {
              direction = 'up';
            } else if (directionStr === 'A sinistra del corpo' || directionStr === 'Sinistra' || directionStr === '◀') {
              direction = 'left';
            } else if (directionStr === 'Al corpo' || directionStr === 'Centro' || directionStr === '●') {
              direction = 'center';
            } else if (directionStr === 'A destra del corpo' || directionStr === 'Destra' || directionStr === '▶') {
              direction = 'right';
            } else if (directionStr === 'Dietro al corpo' || directionStr === 'Dietro' || directionStr === '▼') {
              direction = 'down';
            }

            // Converti velocità
            const speed = speedStr ? parseFloat(speedStr) : null;

            // Crea l'oggetto ricezione
            const ricezione = {
              id: Date.now() + Math.random() + index,
              playerIndex: isNaN(playerIndex) ? 0 : playerIndex,
              playerName: giocatoreStr || 'Sconosciuto',
              zone: isNaN(zone) ? 0 : zone,
              side: side,
              serveType: serveType,
              serveZone: isNaN(serveZone) ? 1 : serveZone,
              fundamental: fundamental,
              direction: direction,
              outcome: outcome,
              speed: isNaN(speed as number) ? null : speed,
              timestamp: timestamp,
            };
            
            ricezioniImportate.push(ricezione);
          } catch (err) {
            console.error(`Errore nella riga ${index + 1}:`, err);
            errori++;
          }
        });
      });

      // Chiama la funzione di callback per importare i dati nell'app principale
      if (onImportData) {
        onImportData(ricezioniImportate);
        
        let messaggio = `✅ ${ricezioniImportate.length} ricezioni importate con successo!`;
        if (errori > 0) {
          messaggio += `\n\n⚠️ ${errori} righe hanno avuto errori e sono state saltate.`;
        }
        messaggio += `\n\nPuoi ora continuare il lavoro con i dati caricati.`;
        
        alert(messaggio);
      } else {
        alert('❌ Errore: Funzione di importazione non disponibile');
      }
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      alert(`❌ Errore durante l'importazione dei dati:\n\n${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  };

  const trovaPositivita = () => {
    if (analisi.length < 2) return null;
    
    const prima = analisi[0];
    const ultima = analisi[analisi.length - 1];
    
    const miglioramentoPP = ultima.pp - prima.pp;
    const miglioramentoER = ultima.er - prima.er;
    
    return {
      pp: miglioramentoPP,
      er: miglioramentoER,
      tendenza: miglioramentoPP > 0 ? 'positiva' : miglioramentoPP < 0 ? 'negativa' : 'stabile'
    };
  };

  const trovaCriticitа = () => {
    if (analisi.length < 2) return null;
    
    const prima = analisi[0];
    const ultima = analisi[analisi.length - 1];
    
    const peggioramentoPE = ultima.pe - prima.pe;
    const peggioramentoPN = ultima.pn - prima.pn;
    
    return {
      pe: peggioramentoPE,
      pn: peggioramentoPN,
      tendenza: peggioramentoPE > 0 ? 'peggiorata' : peggioramentoPE < 0 ? 'migliorata' : 'stabile'
    };
  };

  const positivita = trovaPositivita();
  const criticita = trovaCriticitа();

  return (
    <div className="analisi-multipla-container">
      <h2 className="analisi-multipla-titolo">📊 Analisi Multi-Giornata</h2>
      
      {/* Sezione Caricamento File */}
      <div className="analisi-multipla-sezione">
        <h3>📁 Caricamento File</h3>
        <p className="analisi-multipla-descrizione">
          Carica i file Excel/CSV esportati dall'app. Il nome del file deve contenere la data nel formato: <code>ricezioni_complete_YYYY-MM-DD</code>
        </p>
        
        <div className="analisi-multipla-upload">
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="analisi-multipla-input"
            disabled={caricamento}
          />
          <label className="analisi-multipla-label">
            {caricamento ? '⏳ Caricamento...' : '📂 Seleziona File'}
          </label>
        </div>

        {fileCaricati.length > 0 && (
          <div className="analisi-multipla-file-lista">
            <h4>File Caricati ({fileCaricati.length}):</h4>
            <ul>
              {fileCaricati.map((file, index) => (
                <li key={index}>
                  <span className="analisi-multipla-file-data">{file.data}</span>
                  <span className="analisi-multipla-file-nome">{file.fileName}</span>
                  <span className="analisi-multipla-file-count">{file.ricezioni.length} ricezioni</span>
                  <button
                    onClick={() => rimuoviFile(index)}
                    className="analisi-multipla-rimuovi"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="analisi-multipla-azioni">
              <button onClick={calcolaAnalisi} className="analisi-multipla-btn analisi-multipla-btn-calcola">
                📈 Calcola Analisi
              </button>
              {onImportData && (
                <button onClick={importaDatiNellApp} className="analisi-multipla-btn analisi-multipla-btn-importa">
                  📥 Importa Dati nell'App
                </button>
              )}
              <button onClick={resettaTutto} className="analisi-multipla-btn analisi-multipla-btn-reset">
                🗑️ Resetta Tutto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sezione Risultati */}
      {analisi.length > 0 && (
        <>
          {/* Sintesi Evoluzione */}
          <div className="analisi-multipla-sezione">
            <h3>📊 Evoluzione Temporale</h3>
            <p className="analisi-multipla-periodo">
              Periodo analizzato: <strong>{analisi[0].data}</strong> → <strong>{analisi[analisi.length - 1].data}</strong>
              <br />
              Giornate analizzate: <strong>{analisi.length}</strong>
            </p>

            {positivita && (
              <div className={`analisi-multipla-sintesi ${positivita.tendenza === 'positiva' ? 'positivo' : positivita.tendenza === 'negativa' ? 'negativo' : 'stabile'}`}>
                <h4>✅ Positività</h4>
                <p>
                  PP: {positivita.pp > 0 ? '+' : ''}{positivita.pp.toFixed(1)}% 
                  {positivita.tendenza === 'positiva' ? ' 📈' : positivita.tendenza === 'negativa' ? ' 📉' : ' ➡️'}
                  <br />
                  ER: {positivita.er > 0 ? '+' : ''}{positivita.er.toFixed(1)}%
                </p>
                <p className="analisi-multipla-tendenza">
                  Tendenza: <strong>{positivita.tendenza === 'positiva' ? 'MIGLIORAMENTO' : positivita.tendenza === 'negativa' ? 'PEGGIORAMENTO' : 'STABILE'}</strong>
                </p>
              </div>
            )}

            {criticita && (
              <div className={`analisi-multipla-sintesi ${criticita.tendenza === 'peggiorata' ? 'negativo' : criticita.tendenza === 'migliorata' ? 'positivo' : 'stabile'}`}>
                <h4>⚠️ Criticità</h4>
                <p>
                  PE: {criticita.pe > 0 ? '+' : ''}{criticita.pe.toFixed(1)}%
                  {criticita.tendenza === 'peggiorata' ? ' 📈' : criticita.tendenza === 'migliorata' ? ' 📉' : ' ➡️'}
                  <br />
                  PN: {criticita.pn > 0 ? '+' : ''}{criticita.pn.toFixed(1)}%
                </p>
                <p className="analisi-multipla-tendenza">
                  Tendenza: <strong>{criticita.tendenza === 'peggiorata' ? 'AUMENTO ERRORI' : criticita.tendenza === 'migliorata' ? 'RIDUZIONE ERRORI' : 'STABILE'}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Tabella Dettagliata */}
          <div className="analisi-multipla-sezione">
            <h3>📋 Dettagli per Giornata</h3>
            <div className="analisi-multipla-tabella-container">
              <table className="analisi-multipla-tabella">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>File</th>
                    <th>Totale</th>
                    <th>PP %</th>
                    <th>ER %</th>
                    <th>PE %</th>
                    <th>PN %</th>
                    <th>#</th>
                    <th>+</th>
                    <th>!</th>
                    <th>-</th>
                    <th>/</th>
                    <th>=</th>
                  </tr>
                </thead>
                <tbody>
                  {analisi.map((giorno, index) => (
                    <tr key={index}>
                      <td><strong>{giorno.data}</strong></td>
                      <td className="analisi-multipla-filename">{giorno.fileName}</td>
                      <td>{giorno.totale}</td>
                      <td className={giorno.pp >= 55 ? 'valore-positivo' : giorno.pp >= 45 ? 'valore-medio' : 'valore-negativo'}>
                        {giorno.pp.toFixed(1)}%
                      </td>
                      <td className={giorno.er >= 45 ? 'valore-positivo' : giorno.er >= 40 ? 'valore-medio' : 'valore-negativo'}>
                        {giorno.er.toFixed(1)}%
                      </td>
                      <td className={giorno.pe <= 10 ? 'valore-positivo' : giorno.pe <= 20 ? 'valore-medio' : 'valore-negativo'}>
                        {giorno.pe.toFixed(1)}%
                      </td>
                      <td className={giorno.pn <= 15 ? 'valore-positivo' : giorno.pn <= 25 ? 'valore-medio' : 'valore-negativo'}>
                        {giorno.pn.toFixed(1)}%
                      </td>
                      <td>{giorno.perfette}</td>
                      <td>{giorno.positive}</td>
                      <td>{giorno.esclamative}</td>
                      <td>{giorno.negative}</td>
                      <td>{giorno.slash}</td>
                      <td>{giorno.errori}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grafico Semplice con Barre */}
          <div className="analisi-multipla-sezione">
            <h3>📈 Andamento PP ed ER</h3>
            <div className="analisi-multipla-grafico">
              {analisi.map((giorno, index) => (
                <div key={index} className="analisi-multipla-barra-gruppo">
                  <div className="analisi-multipla-barra-container">
                    <div 
                      className="analisi-multipla-barra pp"
                      style={{ height: `${giorno.pp}%` }}
                      title={`PP: ${giorno.pp.toFixed(1)}%`}
                    >
                      <span className="analisi-multipla-barra-label">{giorno.pp.toFixed(0)}%</span>
                    </div>
                    <div 
                      className="analisi-multipla-barra er"
                      style={{ height: `${Math.max(giorno.er, 0)}%` }}
                      title={`ER: ${giorno.er.toFixed(1)}%`}
                    >
                      <span className="analisi-multipla-barra-label">{giorno.er.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="analisi-multipla-barra-data">{giorno.data.slice(5)}</div>
                </div>
              ))}
            </div>
            <div className="analisi-multipla-legenda">
              <span className="analisi-multipla-legenda-item">
                <span className="analisi-multipla-legenda-color pp"></span> PP (Percentuale Positiva)
              </span>
              <span className="analisi-multipla-legenda-item">
                <span className="analisi-multipla-legenda-color er"></span> ER (Efficienza)
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
