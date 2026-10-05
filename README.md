# 🏐 Scout Ricezione Pallavolo

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live-blue?logo=github)](https://maticciofive.github.io/scout_ricezione/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 Descrizione

**Scout Ricezione** è un'applicazione web professionale per lo scouting tecnico della ricezione nella pallavolo. Progettata per allenatori, scout e analisti tecnici, permette di registrare, analizzare e generare resoconti dettagliati sulle performance di ricezione dei giocatori, con metriche avanzate, soglie personalizzabili e report professionali pronti per la programmazione degli allenamenti.

🌐 **App live:** [https://maticciofive.github.io/scout_ricezione/](https://maticciofive.github.io/scout_ricezione/)

---

## ✨ Funzionalità

### 🎯 Registrazione Colpi
- **Configurazione giocatori**: da 2 a 6 giocatori con persistenza in `localStorage`
- **Campo da gioco 3×3** con zone numerate secondo lo standard pallavolistico:
  - Riga superiore: `4 - 3 - 2`
  - Riga centrale: `7 - 8 - 9`
  - Riga inferiore: `5 - 6 - 1`
- **Giocatori spostabili liberamente** sul campo con drag & drop (coordinate X/Y percentuali)
- **5 direzioni** di ricezione con tooltip: ▲ ● ► ▼ ◄
- **6 esiti colorati**:
  - `#` Perfetta (verde scuro)
  - `+` Positiva (verde chiaro)
  - `!` Esclamativa (giallo)
  - `-` Negativa (arancione)
  - `/` Slash (grigio)
  - `=` Errore / Ace subìto (rosso)

### 🏓 Parametri di Battuta
- **Zona di provenienza**: 1, 6, 5
- **Velocità**: Lenta 🐢, Media 🚶, Veloce 
- **Tipologia**: Flottante , Jump Top Spin 🌀, Jump Flottante ⚡

### 🧠 Analisi Tecnica Avanzata (Match Analysis)
- **Parte del corpo**: avambracci, mani, piedi, petto, altro
- **Zona di impatto**: centrale, destra, sinistra, sopra-testa, sotto-vita
- **Posizione del corpo**: bilanciata, sbilanciata, indietrata, avanzata, in tuffo
- **Qualità movimento**: ottimo, buono, sufficiente, scarso

###  Metriche Calcolate
| Metrica | Formula | Interpretazione |
|---------|---------|-----------------|
| **PP** (Percentuale Positiva) | `(# + +) / totale × 100` | ≥ 55% = buono |
| **ER** (Efficienza Ricezione) | `(# + + − =) / totale × 100` | ≥ 45% = ottimo, ≥ 40% = buono |
| **PE** (Percentuale Errori) | `= / totale × 100` | Solo Ace subiti |
| **PN** (Percentuale Negativa) | `(- + /) / totale × 100` | Ricezioni giocabili ma difficili |

### 🎨 Soglie Configurabili Globali
Pannello UI dedicato per personalizzare le soglie di colore (verde/arancione/rosso) separatamente per:
- Ricezioni **positive** (# +)
- Ricezioni **negative** (!, -, /)
- **Errori** (=)

Le soglie sono salvate in `localStorage` e si applicano a **tutta l'app** in tempo reale tramite React Context.

### 📑 Resoconti e Analisi
- **Resoconto Analisi Completa** per giocatore con:
  - Barre di progresso colorate (PP, ER)
  - Tabelle per velocità e tipologia
  - Punti di forza e criticità con numeri concreti
  - Sintesi analitica automatica in italiano
- **Resoconto Professionale** da allenatore:
  - Riepilogo numerico globale
  - Analisi per zona con conteggio di ogni esito
  - Analisi tecnica (bagher vs palleggio)
  - Raccomandazioni con verifica spaziale corretta (es. "lavorare sul LATO DESTRO")
- **Analisi Comparativa** multi-partita:
  - Import di più file Excel/CSV divisi per data
  - Tendenze nel tempo (miglioramento/peggioramento)
  - Criticità ricorrenti e punti di forza consolidati
- **Tabella Analisi Incrociata** (pivot):
  - Giocatore × Zona × Tipologia di battuta
  - Percentuali dei 6 esiti per ogni combinazione
- **Match Analysis** con correlazioni tecniche e pattern ideali/problematici

### 📥 Import / Export
- **Export CSV** con tutte le colonne (giocatore, zona, direzione, esito, provenienza, velocità, tipologia, timestamp)
- **Export Resoconto** in formato `.txt` formattato
- **Import file Excel/CSV** con drag & drop per analisi storiche

---

## 🛠️ Stack Tecnologico

- **React 18** + **TypeScript 5**
- **Vite 5** (bundler e dev server)
- **CSS puro** con `clamp()` per design responsive
- **GitHub Actions** per CI/CD automatico
- **GitHub Pages** per hosting
- **SheetJS (xlsx)** per parsing file Excel

---

## 🚀 Installazione e Sviluppo

### Prerequisiti
- Node.js 18+ e npm

### Setup locale
```bash
# Clona il repository
git clone https://github.com/maticciofive/scout_ricezione.git
cd scout_ricezione

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
