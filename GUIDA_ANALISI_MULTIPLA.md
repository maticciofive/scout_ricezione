# 📊 Analisi Multi-Giornata - Guida all'Uso

## Funzionalità

Il modulo **Analisi Multi-Giornata** permette di confrontare l'evoluzione delle performance di ricezione su più giornate, identificando tendenze, miglioramenti e criticità nel tempo.

## Come Funziona

### 1. Esporta i File Giornalieri

Dall'app principale, esporta i file Excel/CSV alla fine di ogni giornata di scouting:
- Il file avrà il nome: `ricezioni_complete_YYYY-MM-DD.xls` (o `.csv`)
- Esempio: `ricezioni_complete_2026-01-15.xls`

### 2. Carica i File

1. Clicca su **"📂 Seleziona File"**
2. Seleziona uno o più file Excel/CSV (puoi selezionarne multiple alla volta)
3. I file vengono elencati con:
   - **Data** estratta dal nome del file
   - **Nome file** completo
   - **Numero di ricezioni** contenute

### 3. Calcola l'Analisi

Clicca su **"📈 Calcola Analisi"** per generare il report comparativo.

## Cosa Viene Analizzato

### 📊 Evoluzione Temporale

Il sistema calcola automaticamente:

#### ✅ Positività
- **PP (Percentuale Positiva)**: Variazione tra prima e ultima giornata
- **ER (Efficienza di Ricezione)**: Variazione tra prima e ultima giornata
- **Tendenza**: Miglioramento 📈 / Peggioramento 📉 / Stabile ➡️

#### ⚠️ Criticità
- **PE (Percentuale Errori)**: Variazione tra prima e ultima giornata
- **PN (Percentuale Negativa)**: Variazione tra prima e ultima giornata
- **Tendenza**: Aumento errori 📈 / Riduzione errori 📉 / Stabile ➡️

### 📋 Tabella Dettagliata

Per ogni giornata mostra:
- **Data** e nome file
- **Totale** ricezioni
- **PP %** (verde ≥55%, giallo 45-54%, rosso <45%)
- **ER %** (verde ≥45%, giallo 40-44%, rosso <40%)
- **PE %** (verde ≤10%, giallo 11-20%, rosso >20%)
- **PN %** (verde ≤15%, giallo 16-25%, rosso >25%)
- Distribuzione esiti: #, +, !, -, /, =

### 📈 Grafico Andamento

Grafico a barre che mostra visivamente:
- **Barre verdi**: PP (Percentuale Positiva)
- **Barre blu**: ER (Efficienza)
- **Date** sull'asse orizzontale

## Interpretazione dei Risultati

### Tendenza Positiva ✅
- PP e ER in aumento → Il giocatore sta migliorando
- PE e PN in diminuzione → Meno errori e ricezioni negative

### Tendenza Negativa ❌
- PP e ER in diminuzione → Il giocatore sta peggiorando
- PE e PN in aumento → Più errori e ricezioni negative

### Tendenza Stabile ➡️
- Metriche costanti → Performance uniforme nel periodo

## Esempio Pratico

### Scenario: 5 Giornate di Allenamento

```
Giornata 1 (2026-01-10): PP 45%, ER 35%
Giornata 2 (2026-01-12): PP 48%, ER 38%
Giornata 3 (2026-01-14): PP 52%, ER 42%
Giornata 4 (2026-01-16): PP 55%, ER 45%
Giornata 5 (2026-01-18): PP 58%, ER 48%
```

**Risultato**: 
- ✅ **Positività**: PP +13%, ER +13% → **MIGLIORAMENTO**
- ⚠️ **Criticità**: PE -5%, PN -8% → **RIDUZIONE ERRORI**

**Conclusione**: Il giocatore ha mostrato un chiaro miglioramento nelle performance di ricezione nell'arco di 5 giornate.

## Consigli per l'Analisi

### 1. Carica Almeno 3 Giornate
Per avere un'analisi significativa, carica almeno 3 file giornalieri.

### 2. Intervallo Regolare
Ideale caricare file con intervalli regolari (es. ogni 2-3 giorni) per vedere l'evoluzione.

### 3. Confronta Periodi Diversi
- **Prima dell'allenamento specifico**: 3-5 file
- **Dopo l'allenamento specifico**: 3-5 file
- Confronta le tendenze per valutare l'efficacia dell'allenamento

### 4. Identifica Pattern
- Miglioramenti costanti → Buon adattamento
- Fluttuazioni → Possibile inconsistenza
- Peggioramento → Necessità di调整 allenamento

## Funzionalità Avanzate

### Rimuovi Singoli File
Clicca sulla **✕** accanto a un file per rimuoverlo dall'analisi senza resettare tutto.

### Resetta Tutto
Clicca su **"🗑️ Resetta Tutto"** per cancellare tutti i file caricati e ricominciare.

### Formati Supportati
- **Excel**: `.xlsx`, `.xls`
- **CSV**: `.csv` (con separatore `;`)

## Note Tecniche

- I file vengono letti **localmente** nel browser (nessun upload su server)
- La data viene estratta dal **nome del file** (pattern: `ricezioni_complete_YYYY-MM-DD`)
- I file vengono ordinati automaticamente dalla **data più vecchia alla più recente**
- L'analisi è **reattiva**: si aggiorna automaticamente quando aggiungi/rimuovi file

## Risoluzione Problemi

### "Data sconosciuta"
Il nome del file non segue il pattern corretto. Rinomina il file come: `ricezioni_complete_YYYY-MM-DD.xls`

### "Errore nel caricamento"
- Verifica che il file sia un Excel/CSV valido
- Controlla che il file non sia corrotto
- Prova a riesportare il file dall'app principale

### Grafico non visibile
- Carica almeno 2 file per vedere il grafico
- Verifica che i file contengano dati (almeno 1 ricezione)

## Esempi di File

### Nome File Corretto ✅
- `ricezioni_complete_2026-01-15.xls`
- `ricezioni_complete_2026-01-16.xlsx`
- `ricezioni_complete_2026-01-17.csv`

### Nome File Errato ❌
- `ricezioni.xls` (manca la data)
- `scouting_2026-01-15.xls` (pattern diverso)
- `ricezioni_complete_15-01-2026.xls` (formato data errato)

---

**Buona analisi!** 📊🏐
