import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

      // Titolo del report
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Scouting Ricezione', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Data del report
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      if (reportType === 'completo' || reportType === 'giocatore') {
        // Statistiche generali
        const giocatoriDaAnalizzare = reportType === 'giocatore' 
          ? [players[selectedPlayer]] 
          : players;

        giocatoriDaAnalizzare.forEach((player, playerIdx) => {
          const playerReceptions = receptions.filter(r => r.playerIndex === (reportType === 'giocatore' ? selectedPlayer : playerIdx));
          
          if (playerReceptions.length === 0) return;

          // Nome giocatore
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(player.name, 20, yPos);
          yPos += 8;

          // Statistiche generali
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
          doc.text(`Totale ricezioni: ${totale}`, 20, yPos);
          yPos += 6;

          // Tabella esiti
          const esitiData = [
            ['Perfette (#)', perfette.toString(), `${((perfette / totale) * 100).toFixed(1)}%`],
            ['Positive (+)', positive.toString(), `${((positive / totale) * 100).toFixed(1)}%`],
            ['Esclamative (!)', esclamative.toString(), `${((esclamative / totale) * 100).toFixed(1)}%`],
            ['Negative (-)', negative.toString(), `${((negative / totale) * 100).toFixed(1)}%`],
            ['Slash (/)', slash.toString(), `${((slash / totale) * 100).toFixed(1)}%`],
            ['Errori (=)', errori.toString(), `${((errori / totale) * 100).toFixed(1)}%`],
          ];

          (doc as any).autoTable({
            startY: yPos,
            head: [['Esito', 'Numero', 'Percentuale']],
            body: esitiData,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] },
            margin: { left: 20 },
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;

          // Metriche principali
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Metriche Principali', 20, yPos);
          yPos += 8;

          const metricheData = [
            ['PP (Percentuale Positiva)', `${pp.toFixed(1)}%`],
            ['ER (Efficienza)', `${er.toFixed(1)}%`],
            ['PE (Percentuale Errori)', `${pe.toFixed(1)}%`],
            ['PN (Percentuale Negativa)', `${pn.toFixed(1)}%`],
          ];

          (doc as any).autoTable({
            startY: yPos,
            head: [['Metrica', 'Valore']],
            body: metricheData,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] },
            margin: { left: 20 },
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;

          // Statistiche per lato
          if (yPos > 220) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Performance per Lato', 20, yPos);
          yPos += 8;

          const lati = ['Sinistra', 'Centro', 'Destra'];
          const latoData = lati.map(lato => {
            const latoReceptions = playerReceptions.filter(r => r.side === lato);
            const latoTotale = latoReceptions.length;
            const latoPositive = latoReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
            const latoErrors = latoReceptions.filter(r => r.outcome === '=').length;
            const latoPP = latoTotale > 0 ? (latoPositive / latoTotale) * 100 : 0;
            const latoER = latoTotale > 0 ? ((latoPositive - latoErrors) / latoTotale) * 100 : 0;

            return [lato, latoTotale.toString(), `${latoPP.toFixed(1)}%`, `${latoER.toFixed(1)}%`];
          });

          (doc as any).autoTable({
            startY: yPos,
            head: [['Lato', 'Totale', 'PP', 'ER']],
            body: latoData,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] },
            margin: { left: 20 },
          });

          yPos = (doc as any).lastAutoTable.finalY + 15;

          // Separatore tra giocatori
          if (reportType === 'completo' && playerIdx < giocatoriDaAnalizzare.length - 1) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPos, pageWidth - 20, yPos);
            yPos += 10;
          }
        });
      }

      if (reportType === 'sessione') {
        // Report per sessione
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Report per Sessione', 20, yPos);
        yPos += 10;

        // Raggruppa ricezioni per data
        const sessioni: Record<string, Reception[]> = {};
        receptions.forEach(r => {
          const data = r.timestamp.split(',')[0] || r.timestamp.split(' ')[0] || 'Data sconosciuta';
          if (!sessioni[data]) sessioni[data] = [];
          sessioni[data].push(r);
        });

        Object.entries(sessioni).forEach(([data, sessionReceptions]) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Sessione: ${data}`, 20, yPos);
          yPos += 8;

          const totale = sessionReceptions.length;
          const positive = sessionReceptions.filter(r => r.outcome === '#' || r.outcome === '+').length;
          const errors = sessionReceptions.filter(r => r.outcome === '=').length;
          const pp = (positive / totale) * 100;
          const er = ((positive - errors) / totale) * 100;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Totale ricezioni: ${totale}`, 20, yPos);
          yPos += 6;
          doc.text(`PP: ${pp.toFixed(1)}% | ER: ${er.toFixed(1)}%`, 20, yPos);
          yPos += 10;
        });
      }

      // Footer su tutte le pagine
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Pagina ${i} di ${pageCount} - Generato da Scouting Ricezione Pallavolo`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Salva il PDF
      const fileName = `report_scouting_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert('✅ Report PDF generato con successo!');
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      alert('❌ Errore durante la generazione del PDF. Controlla la console per i dettagli.');
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
          <select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
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
          <li>Metriche principali (PP, ER, PE, PN)</li>
          <li>Performance per lato (Sinistra, Centro, Destra)</li>
          <li>Formattazione professionale pronta per la stampa</li>
        </ul>
      </div>
    </div>
  );
}
