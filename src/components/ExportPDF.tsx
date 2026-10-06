import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './ExportPDF.css';

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
  timestamp: string;
}

interface Player {
  id: number;
  name: string;
  zone: number;
}

interface ExportPDFProps {
  players: Player[];
  receptions: Reception[];
}

// Helper per disegnare una tabella manualmente con jsPDF
function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number,
  options: {
    headColor?: [number, number, number];
    margin?: number;
    fontSize?: number;
  } = {}
): number {
  const { headColor = [30, 64, 175], margin = 20, fontSize = 9 } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const colWidth = (pageWidth - margin * 2) / headers.length;
  const rowHeight = 8;
  let yPos = startY;

  // Disegna header
  doc.setFillColor(headColor[0], headColor[1], headColor[2]);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');

  headers.forEach((header, i) => {
    doc.rect(margin + i * colWidth, yPos, colWidth, rowHeight, 'F');
    doc.text(header, margin + i * colWidth + 2, yPos + 5.5);
  });

  yPos += rowHeight;

  // Disegna righe
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  rows.forEach((row, rowIdx) => {
    // Verifica se serve una nuova pagina
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }

    // Colore alternato per righe
    if (rowIdx % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, yPos, pageWidth - margin * 2, rowHeight, 'F');
    }

    // Bordo riga
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight);

    row.forEach((cell, i) => {
      doc.text(cell, margin + i * colWidth + 2, yPos + 5.5);
    });

    yPos += rowHeight;
  });

  // Bordo esterno tabella
  doc.setDrawColor(headColor[0], headColor[1], headColor[2]);
  doc.rect(margin, startY, pageWidth - margin * 2, yPos - startY);

  // Colonne verticali
  doc.setDrawColor(200, 200, 200);
  for (let i = 1; i < headers.length; i++) {
    doc.line(margin + i * colWidth, startY, margin + i * colWidth, yPos);
  }

  return yPos + 10;
}

export default function ExportPDF({ players, receptions }: ExportPDFProps) {
  const [exporting, setExporting] = useState(false);
  const [reportType, setReportType] = useState<'completo' | 'giocatore' | 'sessione'>('completo');
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);

  const esportaPDF = () => {
    setExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // === TITOLO DEL REPORT ===
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('Report Scouting Ricezione', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      // Sottotitolo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      doc.text(`Totale ricezioni: ${receptions.length}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Linea separatore
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      if (reportType === 'completo' || reportType === 'giocatore') {
        const giocatoriDaAnalizzare = reportType === 'giocatore'
          ? [players[selectedPlayer]]
          : players;

        giocatoriDaAnalizzare.forEach((player, playerIdx) => {
          const playerIndex = reportType === 'giocatore' ? selectedPlayer : playerIdx;
          const playerReceptions = receptions.filter(r => r.playerIndex === playerIndex);

          if (playerReceptions.length === 0) return;

          // Verifica nuova pagina
          if (yPos > 230) {
            doc.addPage();
            yPos = 20;
          }

          // === NOME GIOCATORE ===
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text(player.name, 20, yPos);
          yPos += 8;

          // === STATISTICHE GENERALI ===
          const totale = playerReceptions.length;
          const perfette = playerReceptions.filter(r => r.outcome === '#').length;
          const positive = playerReceptions.filter(r => r.outcome === '+').length;
          const esclamative = playerReceptions.filter(r => r.outcome === '!').length;
          const negative = playerReceptions.filter(r => r.outcome === '-').length;
          const slash = playerReceptions.filter(r => r.outcome === '/').length;
          const errori = playerReceptions.filter(r => r.outcome === '=').length;

          const pp = ((perfette + positive) / totale) * 100;
          const er = ((perfette + positive - errori) / totale) * 100;
          const pe = (errori / totale) * 100;
          const pn = ((negative + slash) / totale) * 100;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          doc.text(`Totale ricezioni: ${totale}`, 20, yPos);
          yPos += 8;

          // === TABELLA ESITI ===
          const esitiHeaders = ['Esito', 'Numero', 'Percentuale'];
          const esitiRows = [
            ['Perfette (#)', perfette.toString(), `${((perfette / totale) * 100).toFixed(1)}%`],
            ['Positive (+)', positive.toString(), `${((positive / totale) * 100).toFixed(1)}%`],
            ['Esclamative (!)', esclamative.toString(), `${((esclamative / totale) * 100).toFixed(1)}%`],
            ['Negative (-)', negative.toString(), `${((negative / totale) * 100).toFixed(1)}%`],
            ['Slash (/)', slash.toString(), `${((slash / totale) * 100).toFixed(1)}%`],
            ['Errori (=)', errori.toString(), `${((errori / totale) * 100).toFixed(1)}%`],
          ];

          yPos = drawTable(doc, esitiHeaders, esitiRows, yPos);

          // === METRICHE PRINCIPALI ===
          if (yPos > 220) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('Metriche Principali', 20, yPos);
          yPos += 8;

          const metricheHeaders = ['Metrica', 'Valore', 'Giudizio'];
          const metricheRows = [
            ['PP (Percentuale Positiva)', `${pp.toFixed(1)}%`, pp >= 55 ? 'Ottimo' : pp >= 45 ? 'Buono' : 'Da migliorare'],
            ['ER (Efficienza)', `${er.toFixed(1)}%`, er >= 45 ? 'Ottimo' : er >= 40 ? 'Buono' : 'Insufficiente'],
            ['PE (Percentuale Errori)', `${pe.toFixed(1)}%`, pe <= 5 ? 'Ottimo' : pe <= 15 ? 'Attenzione' : 'Critico'],
            ['PN (Percentuale Negativa)', `${pn.toFixed(1)}%`, pn <= 10 ? 'Ottimo' : pn <= 25 ? 'Attenzione' : 'Critico'],
          ];

          yPos = drawTable(doc, metricheHeaders, metricheRows, yPos);

          // === PERFORMANCE PER LATO ===
          if (yPos > 200) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('Performance per Lato', 20, yPos);
          yPos += 8;

          const lati = ['Sinistra', 'Centro', 'Destra'];
          const latoHeaders = ['Lato', 'Totale', 'PP', 'ER'];
          const latoRows = lati.map(lato => {
            const latoReceptions = playerReceptions.filter(r => r.side === lato);
            const latoTotale = latoReceptions.length;
            const latoPositive = latoReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
            const latoErrors = latoReceptions.filter(r => r.outcome === '=').length;
            const latoPP = latoTotale > 0 ? (latoPositive / latoTotale) * 100 : 0;
            const latoER = latoTotale > 0 ? ((latoPositive - latoErrors) / latoTotale) * 100 : 0;

            return [lato, latoTotale.toString(), `${latoPP.toFixed(1)}%`, `${latoER.toFixed(1)}%`];
          });

          yPos = drawTable(doc, latoHeaders, latoRows, yPos);

          // === PERFORMANCE PER FONDAMENTALE ===
          if (yPos > 200) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('Performance per Fondamentale', 20, yPos);
          yPos += 8;

          const fondHeaders = ['Fondamentale', 'Totale', 'PP', 'ER', 'PE'];
          const fondRows = [
            { key: 'B', label: 'Bagher' },
            { key: 'P', label: 'Palleggio' },
          ].map(f => {
            const fondReceptions = playerReceptions.filter(r => r.fundamental === f.key);
            const fondTotale = fondReceptions.length;
            const fondPositive = fondReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
            const fondErrors = fondReceptions.filter(r => r.outcome === '=').length;
            const fondPP = fondTotale > 0 ? (fondPositive / fondTotale) * 100 : 0;
            const fondER = fondTotale > 0 ? ((fondPositive - fondErrors) / fondTotale) * 100 : 0;
            const fondPE = fondTotale > 0 ? (fondErrors / fondTotale) * 100 : 0;

            return [f.label, fondTotale.toString(), `${fondPP.toFixed(1)}%`, `${fondER.toFixed(1)}%`, `${fondPE.toFixed(1)}%`];
          });

          yPos = drawTable(doc, fondHeaders, fondRows, yPos);

          // Separatore tra giocatori
          if (reportType === 'completo' && playerIdx < giocatoriDaAnalizzare.length - 1) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(20, yPos, pageWidth - 20, yPos);
            yPos += 15;
          }
        });
      }

      if (reportType === 'sessione') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('Report per Sessione', 20, yPos);
        yPos += 10;

        // Raggruppa ricezioni per data
        const sessioni: Record<string, Reception[]> = {};
        receptions.forEach(r => {
          const data = r.timestamp.split(',')[0] || r.timestamp.split(' ')[0] || 'Data sconosciuta';
          if (!sessioni[data]) sessioni[data] = [];
          sessioni[data].push(r);
        });

        const sessionHeaders = ['Data', 'Totale', 'PP', 'ER', 'PE'];
        const sessionRows = Object.entries(sessioni).map(([data, sessionReceptions]) => {
          const totale = sessionReceptions.length;
          const positive = sessionReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
          const errors = sessionReceptions.filter(r => r.outcome === '=').length;
          const pp = (positive / totale) * 100;
          const er = ((positive - errors) / totale) * 100;
          const pe = (errors / totale) * 100;

          return [data, totale.toString(), `${pp.toFixed(1)}%`, `${er.toFixed(1)}%`, `${pe.toFixed(1)}%`];
        });

        yPos = drawTable(doc, sessionHeaders, sessionRows, yPos);
      }

      // === FOOTER SU TUTTE LE PAGINE ===
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Linea superiore footer
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, doc.internal.pageSize.getHeight() - 15, pageWidth - 20, doc.internal.pageSize.getHeight() - 15);
        
        // Testo footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Pagina ${i} di ${pageCount} - Generato da Scouting Ricezione Pallavolo`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // === SALVA IL PDF ===
      const fileName = `report_scouting_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert('✅ Report PDF generato con successo!');
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      alert(`❌ Errore durante la generazione del PDF:\n\n${errorMessage}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-pdf-container">
      <h2 className="export-pdf-title">📄 Export Report PDF</h2>
      
      <div className="export-pdf-controls">
        <div className="export-pdf-control-group">
          <label>Tipo di Report:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value as 'completo' | 'giocatore' | 'sessione')}>
            <option value="completo">Report Completo (tutti i giocatori)</option>
            <option value="giocatore">Report Singolo Giocatore</option>
            <option value="sessione">Report per Sessione</option>
          </select>
        </div>

        {reportType === 'giocatore' && (
          <div className="export-pdf-control-group">
            <label>Seleziona Giocatore:</label>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(parseInt(e.target.value))}>
              {players.map((player, idx) => (
                <option key={idx} value={idx}>{player.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          className="export-pdf-btn"
          onClick={esportaPDF}
          disabled={exporting || receptions.length === 0}
        >
          {exporting ? '⏳ Generazione in corso...' : '📥 Genera Report PDF'}
        </button>
      </div>

      <div className="export-pdf-info">
        <h4>ℹ️ Informazioni sul Report</h4>
        <ul>
          <li><strong>Report Completo:</strong> Include statistiche dettagliate per tutti i giocatori</li>
          <li><strong>Report Singolo Giocatore:</strong> Analisi approfondita di un singolo giocatore</li>
          <li><strong>Report per Sessione:</strong> Confronto delle performance tra diverse sessioni</li>
        </ul>
        <p><strong>Contenuto del report:</strong></p>
        <ul>
          <li>Statistiche generali (totale ricezioni, distribuzione esiti)</li>
          <li>Metriche principali (PP, ER, PE, PN) con giudizi</li>
          <li>Performance per lato (Sinistra, Centro, Destra)</li>
          <li>Performance per fondamentale (Bagher, Palleggio)</li>
          <li>Formattazione professionale pronta per la stampa</li>
        </ul>
      </div>
    </div>
  );
}
