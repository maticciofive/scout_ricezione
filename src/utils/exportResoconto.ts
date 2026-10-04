/**
 * Esporta il resoconto completo in formato testo
 */

import { AnalisiGiocatore } from './analisi';
// FIX DISTINZIONE ESITI: Import di getLatoDaZona per precisione spaziale
import { emojiPerClassifica, getLatoDaZona } from './metriche';

/**
 * Genera e scarica un file di testo con il resoconto completo
 */
export function esportaResoconto(analisiList: AnalisiGiocatore[]): void {
  const data = new Date().toISOString().split('T')[0];
  const nomeFile = `resoconto_scouting_${data}.txt`;
  
  let contenuto = '';
  
  // Header
  contenuto += '╔════════════════════════════════════════════════════════════════╗\n';
  contenuto += '║         RESOCONTO ANALISI COMPLETA - SCOUTING RICEZIONE        ║\n';
  contenuto += '╚════════════════════════════════════════════════════════════════╝\n\n';
  contenuto += `Data report: ${new Date().toLocaleString('it-IT')}\n`;
  contenuto += `Giocatori analizzati: ${analisiList.length}\n\n`;
  
  // Per ogni giocatore
  analisiList.forEach((analisi, idx) => {
    contenuto += '\n';
    contenuto += '═'.repeat(70) + '\n';
    contenuto += `${analisi.giocatoreNome.toUpperCase()} - RESOCONTO ANALISI COMPLETA\n`;
    contenuto += '═'.repeat(70) + '\n\n';
    
    if (analisi.datiInsufficienti) {
      contenuto += `⚠️ DATI INSUFFICIENTI\n`;
      contenuto += `   Totale colpi: ${analisi.totaleColpi}\n`;
      contenuto += `   Minimo richiesto: 5 colpi\n`;
      contenuto += `   ${analisi.sintesi}\n\n`;
      return;
    }
    
    // Metriche globali
    contenuto += '📊 METRICHE GLOBALI\n';
    contenuto += '─'.repeat(70) + '\n';
    contenuto += `   Totale colpi: ${analisi.totaleColpi}\n`;
    contenuto += `   Percentuale Positiva (PP): ${analisi.metricheGlobali.pp.toFixed(1)}% ${emojiPerClassifica(analisi.metricheGlobali.classificaPP)}\n`;
    contenuto += `   Efficienza (ER): ${analisi.metricheGlobali.er.toFixed(1)}% ${emojiPerClassifica(analisi.metricheGlobali.classificaER)}\n`;
    // FIX DISTINZIONE ESITI: Separa chiaramente Errori (=) da Negative (-)
    contenuto += `   Errori Diretti/Ace Subiti (=): ${analisi.metricheGlobali.pe.toFixed(1)}%`;
    if (analisi.metricheGlobali.pe >= 15) {
      contenuto += ` ⚠️ CRITICO\n`;
    } else {
      contenuto += `\n`;
    }
    contenuto += `   Ricezioni Negative/Giocabili (-): ${analisi.metricheGlobali.pn.toFixed(1)}%\n\n`;
    
    // Analisi per velocità
    if (analisi.perVelocita.some(v => v.totale > 0)) {
      contenuto += '🏃 ANALISI PER VELOCITÀ\n';
      contenuto += '─'.repeat(70) + '\n';
      contenuto += padRight('Velocità', 15) + padRight('Colpi', 8) + padRight('PP', 10) + padRight('ER', 10) + 'Giudizio\n';
      contenuto += '─'.repeat(70) + '\n';
      analisi.perVelocita.forEach(v => {
        if (v.totale > 0) {
          contenuto += padRight(v.nome, 15) + 
                      padRight(v.totale.toString(), 8) + 
                      padRight(v.pp.toFixed(1) + '%', 10) + 
                      padRight(v.er.toFixed(1) + '%', 10) + 
                      emojiPerClassifica(v.classificaER) + '\n';
        }
      });
      contenuto += '\n';
    }
    
    // Analisi per tipologia
    if (analisi.perTipologia.some(t => t.totale > 0)) {
      contenuto += '🎯 ANALISI PER TIPOLOGIA\n';
      contenuto += '─'.repeat(70) + '\n';
      contenuto += padRight('Tipologia', 20) + padRight('Colpi', 8) + padRight('PP', 10) + padRight('ER', 10) + 'Giudizio\n';
      contenuto += '─'.repeat(70) + '\n';
      analisi.perTipologia.forEach(t => {
        if (t.totale > 0) {
          contenuto += padRight(t.nome, 20) + 
                      padRight(t.totale.toString(), 8) + 
                      padRight(t.pp.toFixed(1) + '%', 10) + 
                      padRight(t.er.toFixed(1) + '%', 10) + 
                      emojiPerClassifica(t.classificaER) + '\n';
        }
      });
      contenuto += '\n';
    }
    
    // Punti di forza
    contenuto += '✅ PUNTI DI FORZA (EVIDENZE POSITIVE)\n';
    contenuto += '─'.repeat(70) + '\n';
    if (analisi.puntiDiForza.caratteristichePositivita) {
      contenuto += `   ✅ Caratteristiche positività: ${analisi.puntiDiForza.caratteristichePositivita}\n`;
    }
    if (analisi.puntiDiForza.migliorEsito) contenuto += `   ✅ Miglior esito: ${analisi.puntiDiForza.migliorEsito}\n`;
    if (analisi.puntiDiForza.migliorZona) contenuto += `   ✅ Zona con più positività: ${analisi.puntiDiForza.migliorZona}\n`;
    if (analisi.puntiDiForza.migliorDirezione) contenuto += `   ✅ Direzione con più positività: ${analisi.puntiDiForza.migliorDirezione}\n`;
    if (analisi.puntiDiForza.migliorProvenienza) contenuto += `   ✅ Provenienza con più positività: ${analisi.puntiDiForza.migliorProvenienza}\n`;
    if (analisi.puntiDiForza.migliorVelocita) contenuto += `   ✅ Velocità con più positività: ${analisi.puntiDiForza.migliorVelocita}\n`;
    if (analisi.puntiDiForza.migliorTipologia) contenuto += `   ✅ Tipologia con più positività: ${analisi.puntiDiForza.migliorTipologia}\n`;
    if (analisi.puntiDiForza.combinazioneMigliore) contenuto += `   ✅ Combinazione con più positività: ${analisi.puntiDiForza.combinazioneMigliore}\n`;
    contenuto += '\n';
    
    // Punti deboli
    contenuto += '⚠️ CRITICITÀ (EVIDENZE NEGATIVE)\n';
    contenuto += '─'.repeat(70) + '\n';
    if (analisi.puntiDeboli.caratteristicheNegativita) {
      contenuto += `   ⚠️ Caratteristiche negatività: ${analisi.puntiDeboli.caratteristicheNegativita}\n`;
    }
    if (analisi.puntiDeboli.esitoNegativoPrevalente) {
      // FIX DISTINZIONE ESITI: Mostra separatamente Errori (=) e Negative (-)
      contenuto += `   ⚠️ Esito negativo prevalente: ${analisi.puntiDeboli.esitoNegativoPrevalente}\n`;
    }
    if (analisi.puntiDeboli.zonaCritica) {
      // FIX SPATIALE: Usa getLatoDaZona per precisione spaziale
      const latoCorretto = getLatoDaZona(analisi.puntiDeboli.zonaCritica);
      contenuto += `   ⚠️ Zona ${analisi.puntiDeboli.zonaCritica}: lavorare sul lato ${latoCorretto}`;
      if (analisi.metricheGlobali.pe >= 15) {
        contenuto += ` (CRITICO: ${analisi.metricheGlobali.pe.toFixed(1)}% errori diretti)`;
      }
      contenuto += `\n`;
    }
    if (analisi.puntiDeboli.direzioneCritica) contenuto += `   ⚠️ Direzione critica: ${analisi.puntiDeboli.direzioneCritica}\n`;
    if (analisi.puntiDeboli.provenienzaCritica) contenuto += `   ⚠️ Provenienza critica: ${analisi.puntiDeboli.provenienzaCritica}\n`;
    if (analisi.puntiDeboli.velocitaCritica) contenuto += `   ⚠️ Velocità critica: ${analisi.puntiDeboli.velocitaCritica}\n`;
    if (analisi.puntiDeboli.tipologiaCritica) contenuto += `   ⚠️ Tipologia critica: ${analisi.puntiDeboli.tipologiaCritica}\n`;
    if (analisi.puntiDeboli.combinazionePeggiore) contenuto += `   ⚠️ Combinazione critica: ${analisi.puntiDeboli.combinazionePeggiore}\n`;
    contenuto += '\n';
    
    // Sintesi
    contenuto += '💡 SINTESI ANALITICA\n';
    contenuto += '─'.repeat(70) + '\n';
    contenuto += `   ${analisi.sintesi}\n\n`;
  });
  
  // Footer
  contenuto += '═'.repeat(70) + '\n';
  contenuto += 'Fine del report\n';
  contenuto += '═'.repeat(70) + '\n';
  
  // Download
  const blob = new Blob([contenuto], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeFile;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility per allineare il testo a destra
 */
function padRight(text: string, length: number): string {
  return text.padEnd(length, ' ');
}
