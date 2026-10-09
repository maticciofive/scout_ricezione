# ⚡ Analisi Velocità e Grafici Professionali - Guida Completa

## 🎯 Funzionalità Implementate

Sono state aggiunte due nuove funzionalità avanzate:

1. **Analisi Velocità del Servizio** - Analisi completa delle performance in base alla velocità della battuta
2. **Grafici Professionali** - 9 tipi di grafici professionali per visualizzazioni avanzate dei dati

---

## ⚡ 1. Analisi Velocità del Servizio

### Descrizione

Componente dedicato all'analisi delle performance in relazione alla velocità della battuta. Permette di identificare a quali velocità il giocatore va in difficoltà e di correlare la velocità con esito, provenienza e lato di ricezione.

### Funzionalità Principali

#### 1.1 Soglia Minima Configurabile
- **Parametro**: Numero minimo di ricezioni con velocità per giocatore
- **Default**: 5 ricezioni
- **Range**: 1-50 ricezioni
- **Scopo**: Evitare analisi statisticamente non significative

#### 1.2 Filtro per Giocatore
- Visualizza tutti i giocatori o un giocatore specifico
- Utile per analisi individuali mirate

#### 1.3 Statistiche Base per Giocatore
Per ogni giocatore con dati sufficienti mostra:
- **Ricezioni con velocità**: Numero e percentuale rispetto al totale
- **Velocità media**: Media di tutte le velocità registrate
- **Range velocità**: Minimo e massimo registrati

#### 1.4 Performance per Range di Velocità
Classifica le ricezioni in tre range:
- 🐢 **Lenta** (< 80 km/h)
- 🚶 **Media** (80-100 km/h)
- 🏃 **Veloce** (≥ 100 km/h)

Per ogni range mostra:
- Numero di ricezioni
- PP (Percentuale Positiva)
- ER (Efficienza)

#### 1.5 Velocità Media per Esito
Analizza la velocità media per ogni tipo di esito:
- # Perfetta
- + Positiva
- ! Esclamativa
- - Negativa
- / Slash
- = Errore

**Utilità**: Identifica se certe velocità portano a esiti migliori o peggiori

#### 1.6 Velocità per Zona di Provenienza
Analizza la velocità media e la PP per ogni zona di provenienza:
- Zona 1
- Zona 5
- Zona 6

**Utilità**: Identifica se certe zone hanno battute più veloci o più lente

#### 1.7 Velocità per Lato di Ricezione
Analizza la velocità media e la PP per ogni lato:
- Sinistra
- Centro
- Destra

**Utilità**: Identifica se certi lati ricevono battute più veloci

#### 1.8 Difficoltà Identificate
Il sistema identifica automaticamente:
- **Velocità critica**: Range di velocità con PP più bassa
- **Provenienza critica**: Zona con PP più bassa
- **Lato critico**: Lato con PP più bassa

### Esempio di Output

```
⚡ Analisi Velocità del Servizio

Giocatore: Marco Rossi
├─ Ricezioni con velocità: 25 / 30 (83.3%)
├─ Velocità media: 87.5 km/h
└─ Range: 65 - 115 km/h

📊 Performance per Range di Velocità
├─ 🐢 Lenta (<80 km/h): 8 ricezioni, PP 65.0%, ER 55.0%
├─ 🚶 Media (80-100 km/h): 12 ricezioni, PP 58.3%, ER 48.3%
└─ 🏃 Veloce (≥100 km/h): 5 ricezioni, PP 40.0%, ER 30.0%

✅ Velocità Media per Esito
├─ Perfetta (#): 3 ricezioni, Vel. media 75.2 km/h
├─ Positiva (+): 10 ricezioni, Vel. media 82.5 km/h
├─ Esclamativa (!): 5 ricezioni, Vel. media 88.3 km/h
├─ Negativa (-): 4 ricezioni, Vel. media 95.7 km/h
└─ Errore (=): 3 ricezioni, Vel. media 102.1 km/h

📍 Velocità per Zona di Provenienza
├─ Zona 1: 10 ricezioni, Vel. media 92.3 km/h, PP 50.0%
├─ Zona 5: 8 ricezioni, Vel. media 85.7 km/h, PP 62.5%
└─ Zona 6: 7 ricezioni, Vel. media 83.2 km/h, PP 57.1%

🎯 Velocità per Lato di Ricezione
├─ Sinistra: 9 ricezioni, Vel. media 88.5 km/h, PP 55.6%
├─ Centro: 10 ricezioni, Vel. media 86.2 km/h, PP 60.0%
└─ Destra: 6 ricezioni, Vel. media 91.8 km/h, PP 50.0%

⚠️ Difficoltà Identificate
├─ Velocità critica: Battute veloce
├─ Provenienza critica: Zona 1
└─ Lato critico: Destra
```

### Interpretazione dei Risultati

**Esempio**: Se un giocatore ha:
- PP 65% su battute lente
- PP 58% su battute medie
- PP 40% su battute veloci

**Significa**: Il giocatore ha difficoltà con le battute veloci e necessita di allenamento specifico su ricezioni ad alta velocità.

**Azione**: Allenamento focalizzato su:
- Ricezioni di battute veloci (≥100 km/h)
- Posizionamento per battute dalla Zona 1
- Lavoro sul lato destro

---

## 📊 2. Grafici Professionali

### Descrizione

Sezione dedicata alla visualizzazione grafica dei dati con 9 tipi di grafici professionali, selezionabili tramite menu a tendina.

### Grafici Disponibili

#### 2.1 📊 Distribuzione Esiti (Pie Chart)
- **Tipo**: Grafico a torta
- **Dati**: Distribuzione percentuale dei 6 esiti (#, +, !, -, /, =)
- **Utilità**: Visione d'insieme della qualità delle ricezioni
- **Colori**: 6 colori distinti per ogni esito

#### 2.2 📍 Performance per Lato (Bar Chart)
- **Tipo**: Grafico a barre
- **Dati**: PP, ER, PE per ogni lato (Sinistra, Centro, Destra)
- **Utilità**: Confronto performance tra i tre lati
- **Barre**: 3 barre per ogni lato (PP blu, ER verde, PE rosso)

#### 2.3 🤲 Performance per Fondamentale (Bar Chart)
- **Tipo**: Grafico a barre
- **Dati**: PP, ER per Bagher e Palleggio
- **Utilità**: Confronto efficacia tra i due fondamentali
- **Barre**: 2 barre per ogni fondamentale (PP blu, ER verde)

#### 2.4 📍 Distribuzione Zone di Provenienza (Pie Chart)
- **Tipo**: Grafico a torta
- **Dati**: Distribuzione ricezioni per zona di provenienza (1, 5, 6)
- **Utilità**: Identificare da dove arrivano la maggior parte delle battute
- **Colori**: 3 colori distinti per ogni zona

#### 2.5 🏐 Performance per Tipo di Battuta (Bar Chart)
- **Tipo**: Grafico a barre
- **Dati**: PP, ER per ogni tipo di battuta (Float, Salto Float, Salto Spin, Splot, Flin)
- **Utilità**: Identificare quali tipi di battuta creano più difficoltà
- **Barre**: 2 barre per ogni tipo (PP blu, ER verde)

#### 2.6 🎯 Radar Performance Multidimensionale (Radar Chart)
- **Tipo**: Grafico radar
- **Dati**: PP, ER per ogni lato (Sinistra, Centro, Destra)
- **Utilità**: Visualizzazione olistica delle performance
- **Linee**: 2 linee sovrapposte (PP blu, ER verde)

#### 2.7 ⚡ Velocità vs Performance (Scatter Plot)
- **Tipo**: Grafico a dispersione
- **Dati**: Velocità (asse X) vs Esito (asse Y)
- **Utilità**: Identificare correlazione tra velocità e successo
- **Condizione**: Disponibile solo se ci sono dati sulla velocità
- **Punti**: Ogni punto rappresenta una ricezione

#### 2.8 📈 Trend Temporale PP (Area Chart)
- **Tipo**: Grafico ad area
- **Dati**: PP giornaliera nel tempo
- **Utilità**: Monitorare progressi o regressioni nel tempo
- **Condizione**: Disponibile solo se ci sono timestamp
- **Area**: Area blu che mostra l'andamento della PP

#### 2.9 👥 Confronto Giocatori (Bar Chart)
- **Tipo**: Grafico a barre
- **Dati**: PP, ER per ogni giocatore
- **Utilità**: Confronto diretto tra giocatori
- **Condizione**: Disponibile solo con filtro "Tutti i giocatori"
- **Barre**: 2 barre per ogni giocatore (PP blu, ER verde)

### Controlli dei Grafici

#### Filtro Giocatore
- **Opzioni**: Tutti i giocatori / Singolo giocatore
- **Effetto**: Filtra tutti i grafici per il giocatore selezionato
- **Nota**: Alcuni grafici (es. Confronto Giocatori) richiedono "Tutti i giocatori"

#### Selezione Tipo di Grafico
- **Menu a tendina** con 9 opzioni
- **Cambio istantaneo** del grafico visualizzato
- **Descrizione emoji** per ogni opzione

### Statistiche Riepilogative

In fondo alla sezione grafici, mostra:
- **Totale Ricezioni**: Numero totale di ricezioni filtrate
- **PP Media**: Percentuale positiva media
- **ER Media**: Efficienza media
- **Ricezioni con Velocità**: Numero di ricezioni con dato velocità

---

## 🔧 Dettagli Tecnici

### File Creati

#### 1. `src/components/AnalisiVelocita.tsx` (350 righe)
Componente React per l'analisi della velocità con:
- Calcolo statistiche base (media, min, max)
- Classificazione per range di velocità
- Analisi per esito, zona, lato
- Identificazione automatica difficoltà
- Filtri per soglia minima e giocatore

#### 2. `src/components/AnalisiVelocita.css` (200 righe)
Stili per il componente AnalisiVelocita con:
- Layout responsive
- Griglie per statistiche
- Colori tematici (giallo/arancione per difficoltà)
- Adattamento mobile

#### 3. `src/components/GraficiProfessionali.tsx` (400 righe)
Componente React per i grafici professionali con:
- 9 tipi di grafici diversi
- Utilizzo di Recharts (libreria grafica)
- Calcoli statistiche con useMemo
- Filtri per giocatore e tipo di grafico
- Gestione casi limite (dati mancanti)

#### 4. `src/components/GraficiProfessionali.css` (150 righe)
Stili per il componente GraficiProfessionali con:
- Layout responsive
- Stili per controlli
- Adattamento mobile

### File Modificati

#### 1. `src/components/ResocontoAnalisi.tsx`
- Aggiunto campo `speed` all'interfaccia `Colpo`
- Aggiunto calcolo statistiche velocità per ogni giocatore
- Aggiunta sezione "Analisi Velocità del Servizio" nel resoconto

#### 2. `src/components/ResocontoAnalisi.css`
- Aggiunti stili per `.resoconto-velocita-stats`
- Aggiunti stili per `.velocita-stat-item`
- Aggiunti stili per `.velocita-stat-label` e `.velocita-stat-value`

#### 3. `src/App.tsx`
- Aggiunti import per `AnalisiVelocita` e `GraficiProfessionali`
- Aggiunti componenti nel JSX dopo `ExportPDF`

### Dipendenze Utilizzate

- **Recharts**: Libreria per grafici professionali (già installata)
  - BarChart, PieChart, RadarChart, ScatterChart, AreaChart
  - Componenti: XAxis, YAxis, CartesianGrid, Tooltip, Legend, ecc.

---

## 📊 Casi d'Uso Pratici

### Caso 1: Identificare Difficoltà con Battute Veloci

**Scenario**: Allenatore nota che il giocatore Marco sbaglia spesso ricezioni.

**Analisi**:
1. Apri "Analisi Velocità del Servizio"
2. Seleziona Marco
3. Osserva "Performance per Range di Velocità"
4. Nota che PP è 40% su battute veloci vs 65% su battute lente

**Conclusione**: Marco ha difficoltà con battute veloci

**Azione**: Allenamento specifico su ricezioni di battute veloci (≥100 km/h)

### Caso 2: Confrontare Performance tra Giocatori

**Scenario**: Selezionatore deve scegliere i migliori ricevitori.

**Analisi**:
1. Apri "Grafici Professionali"
2. Seleziona "Confronto Giocatori"
3. Osserva il grafico a barre con PP e ER di tutti i giocatori
4. Identifica i giocatori con PP e ER più alte

**Conclusione**: Giocatori A e B hanno le migliori performance

**Azione**: Convocare A e B per la partita importante

### Caso 3: Analizzare Trend Temporale

**Scenario**: Allenatore vuole verificare se gli allenamenti stanno funzionando.

**Analisi**:
1. Apri "Grafici Professionali"
2. Seleziona "Trend Temporale PP"
3. Osserva il grafico ad area con l'andamento della PP nel tempo
4. Nota se c'è un trend positivo

**Conclusione**: PP è aumentata dal 45% al 60% in 3 settimane

**Azione**: Continuare con il programma di allenamento attuale

### Caso 4: Identificare Zone Critiche

**Scenario**: Giocatore Luca vuole migliorare le sue ricezioni.

**Analisi**:
1. Apri "Grafici Professionali"
2. Seleziona "Radar Performance Multidimensionale"
3. Osserva il grafico radar con PP e ER per ogni lato
4. Nota che il lato Destra ha PP più bassa

**Conclusione**: Luca ha difficoltà sul lato destro

**Azione**: Allenamento specifico su ricezioni sul lato destro

### Caso 5: Analisi Combinata Velocità + Zona

**Scenario**: Analizzare se certe combinazioni velocità-zona sono problematiche.

**Analisi**:
1. Apri "Analisi Velocità del Servizio"
2. Seleziona il giocatore
3. Osserva "Velocità per Zona di Provenienza"
4. Nota che Zona 1 ha velocità media 92 km/h e PP 50%
5. Nota che Zona 5 ha velocità media 85 km/h e PP 62%

**Conclusione**: Le battute dalla Zona 1 sono più veloci e creano più difficoltà

**Azione**: Allenamento specifico su ricezioni di battute dalla Zona 1

---

## 🎨 Design System

### Colori Utilizzati

**Analisi Velocità**:
```css
--velocita-bg: #f0f9ff;          /* Azzurro chiaro */
--velocita-border: #3b82f6;      /* Blu */
--velocita-text: #1e40af;        /* Blu scuro */
--difficolta-bg: #fef3c7;        /* Giallo chiaro */
--difficolta-border: #f59e0b;    /* Arancione */
```

**Grafici**:
```css
--color-1: #3b82f6;  /* Blu */
--color-2: #10b981;  /* Verde */
--color-3: #f59e0b;  /* Arancione */
--color-4: #ef4444;  /* Rosso */
--color-5: #8b5cf6;  /* Viola */
--color-6: #ec4899;  /* Rosa */
```

### Tipografia
- **Titoli**: clamp(1.3rem, 4vw, 1.8rem)
- **Sottotitoli**: clamp(1.1rem, 3vw, 1.25rem)
- **Testo**: clamp(0.9rem, 2.5vw, 1rem)
- **Label**: 0.85rem

### Layout
- **Grid responsive**: repeat(auto-fit, minmax(200px, 1fr))
- **Gap**: 12-16px
- **Padding**: clamp(16px, 3vw, 24px)
- **Border-radius**: 8-12px

---

## ✅ Build Status

```
✓ 924 modules transformed
✓ dist/assets/index-RLQu1zi_.js: 1,489.92 kB (gzip: 444.23 kB)
✓ dist/assets/index-D_1sp86f.css: 40.39 kB (gzip: 6.64 kB)
✓ built in 14.86s
```

**Build completato con successo!** ✅

---

## 🚀 Prossimi Sviluppi

### Funzionalità Future
1. **Export Grafici**: Salvare i grafici come immagini PNG/SVG
2. **Animazioni**: Transizioni fluide tra i grafici
3. **Interattività**: Click sui grafici per drill-down nei dati
4. **Confronto Temporale**: Sovrapporre grafici di sessioni diverse
5. **Predizioni**: Machine learning per prevedere performance future

### Miglioramenti Tecnici
1. **Ottimizzazione Performance**: Lazy loading dei grafici
2. **Cache Intelligente**: Memorizzare calcoli complessi
3. **Web Workers**: Calcoli in background per dataset grandi
4. **Virtual Scrolling**: Per liste molto lunghe

---

## 📝 Note Importanti

### Compatibilità
- ✅ Tutti i grafici sono responsive
- ✅ Funzionano su desktop e mobile
- ✅ Supportano touch events
- ✅ Accessibili con keyboard navigation

### Limitazioni
- Scatter plot e Trend temporale richiedono dati specifici (velocità, timestamp)
- Confronto giocatori richiede filtro "Tutti i giocatori"
- Analisi velocità richiede almeno N ricezioni con velocità (configurabile)

### Best Practices
1. **Soglia minima**: Impostare almeno 5 ricezioni per analisi significative
2. **Filtri combinati**: Usare filtri per analisi mirate
3. **Confronto temporale**: Monitorare trend nel tempo
4. **Analisi combinata**: Incrociare velocità con zona, lato, esito

---

## 🎉 Conclusione

Le nuove funzionalità di **Analisi Velocità** e **Grafici Professionali** trasformano l'app in uno strumento di analisi dati di livello professionale, permettendo di:

- ✅ Analizzare le performance in relazione alla velocità della battuta
- ✅ Identificare difficoltà specifiche per range di velocità
- ✅ Correlare velocità con esito, provenienza e lato
- ✅ Visualizzare i dati con 9 tipi di grafici professionali
- ✅ Confrontare giocatori e monitorare trend temporali
- ✅ Prendere decisioni basate su dati oggettivi

L'app è ora pronta per l'uso professionale ad alto livello! 🏆
