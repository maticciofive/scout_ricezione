# Evidenze Percentuali per BAGHER e PALLEGGIO

## Panoramica

Sono state implementate delle evidenze percentuali specifiche per le tabelle "Punto di Ricezione per Lato - BAGHER" e "Punto di Ricezione per Lato - PALLEGGIO" che evidenziano le 3 direzioni con più esecuzioni per ogni lato, invece di usare le soglie globali.

## Funzionalità Implementate

### 1. Analisi per Fondamentale

**File**: `src/utils/analisi.ts`

Aggiunta una nuova funzione `calcolaAnalisiPerFondamentale()` che:
- Filtra i colpi per fondamentale (Bagher o Palleggio)
- Per ogni lato (Sinistra, Centro, Destra), calcola le statistiche per ogni direzione
- Identifica le 3 direzioni con più esecuzioni per ogni lato
- Marca queste direzioni come `isTop3: true`

**Struttura dati**:
```typescript
interface AnalisiFondamentalePerLato {
  lato: string;
  totale: number;
  direzioni: {
    direzione: string;
    totale: number;
    percentuale: number;
    isTop3: boolean;
  }[];
}

interface AnalisiFondamentale {
  fondamentale: string;
  totale: number;
  perLato: AnalisiFondamentalePerLato[];
}
```

### 2. Visualizzazione nel Resoconto

**File**: `src/components/ResocontoAnalisi.tsx`

Aggiunte due nuove sezioni dopo "Analisi per Tipologia":

#### Punto di Ricezione per Lato - BAGHER
- Mostra una tabella con 3 lati (Sinistra, Centro, Destra) e 5 direzioni
- Per ogni cella: numero di colpi e percentuale
- **Le 3 direzioni con più esecuzioni per ogni lato sono evidenziate in verde chiaro**
- Descrizione: "Le 3 direzioni con più esecuzioni per ogni lato sono evidenziate"

#### Punto di Ricezione per Lato - PALLEGGIO
- Stessa struttura della tabella BAGHER
- **Le 3 direzioni con più esecuzioni per ogni lato sono evidenziate in blu chiaro**
- Descrizione: "Le 3 direzioni con più esecuzioni per ogni lato sono evidenziate"

### 3. Stili CSS

**File**: `src/components/ResocontoAnalisi.css`

Aggiunti stili per:
- `.resoconto-sezione-descrizione`: testo descrittivo in corsivo
- `.cella-top3`: bordo verde per evidenziare le celle top 3
- Background colorato inline:
  - BAGHER: `#d1fae5` (verde chiaro)
  - PALLEGGIO: `#dbeafe` (blu chiaro)

## Esempio di Output

### Tabella BAGHER
```
┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Lato    │ ▲ Avanti │ ◀ Sin.   │ ● Centro │ ▶ Destra │ ▼ Dietro │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│Sinistra │   12     │    5     │   15     │    3     │    2     │
│(37)     │ 32.4%    │ 13.5%    │ 40.5%    │  8.1%    │  5.4%    │
│         │ 🟢TOP3   │          │ 🟢TOP3   │          │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Centro  │    8     │    4     │   10     │    6     │    2     │
│(30)     │ 26.7%    │ 13.3%    │ 33.3%    │ 20.0%    │  6.7%    │
│         │          │          │ 🟢TOP3   │ 🟢TOP3   │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Destra  │    6     │    9     │    7     │   11     │    4     │
│(37)     │ 16.2%    │ 24.3%    │ 18.9%    │ 29.7%    │ 10.8%    │
│         │          │ 🟢TOP3   │          │ 🟢TOP3   │          │
└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Interpretazione**:
- **Sinistra**: Le 3 direzioni più frequenti sono Centro (40.5%), Avanti (32.4%), Sinistra (13.5%)
- **Centro**: Le 3 direzioni più frequenti sono Centro (33.3%), Avanti (26.7%), Destra (20.0%)
- **Destra**: Le 3 direzioni più frequenti sono Destra (29.7%), Sinistra (24.3%), Centro (18.9%)

### Tabella PALLEGGIO
```
┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Lato    │ ▲ Avanti │ ◀ Sin.   │ ● Centro │ ▶ Destra │ ▼ Dietro │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│Sinistra │    3     │    2     │    5     │    1     │    1     │
│(12)     │ 25.0%    │ 16.7%    │ 41.7%    │  8.3%    │  8.3%    │
│         │ 🔵TOP3   │          │ 🔵TOP3   │          │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Centro  │    2     │    1     │    3     │    2     │    0     │
│( 8)     │ 25.0%    │ 12.5%    │ 37.5%    │ 25.0%    │  0.0%    │
│         │ 🔵TOP3   │          │ 🔵TOP3   │ 🔵TOP3   │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Destra  │    1     │    3     │    2     │    4     │    1     │
│(11)     │  9.1%    │ 27.3%    │ 18.2%    │ 36.4%    │  9.1%    │
│         │          │ 🔵TOP3   │          │ 🔵TOP3   │          │
└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

## Vantaggi

1. **Analisi Specifica per Fondamentale**: Permette di vedere come il giocatore esegue bagher e palleggio in diverse direzioni
2. **Evidenziazione Top 3**: Le 3 direzioni con più esecuzioni sono immediatamente visibili
3. **Colori Differenziati**: 
   - Verde per BAGHER (colore associato alla tecnica di base)
   - Blu per PALLEGGIO (colore associato alla tecnica avanzata)
4. **Percentuali per Lato**: Mostra la distribuzione percentuale all'interno di ogni lato
5. **Indipendenza dalle Soglie Globali**: Non usa le soglie configurabili, ma evidenzia solo le direzioni più frequenti

## Logica di Calcolo

### Algoritmo Top 3

```typescript
// Per ogni lato:
1. Filtra i colpi per fondamentale e lato
2. Per ogni direzione, conta il numero di colpi
3. Calcola la percentuale: (colpi_direzione / totale_lato) * 100
4. Ordina le direzioni per numero di colpi (decrescente)
5. Prendi le prime 3 direzioni con almeno 1 colpo
6. Marca queste direzioni come isTop3: true
```

### Esempio di Calcolo

**Input**: 37 colpi bagher in Zona Sinistra
- Avanti: 12 colpi (32.4%)
- Sinistra: 5 colpi (13.5%)
- Centro: 15 colpi (40.5%)
- Destra: 3 colpi (8.1%)
- Dietro: 2 colpi (5.4%)

**Top 3**:
1. Centro: 15 colpi (40.5%) → isTop3: true
2. Avanti: 12 colpi (32.4%) → isTop3: true
3. Sinistra: 5 colpi (13.5%) → isTop3: true

## File Modificati

1. **src/utils/metriche.ts**
   - Aggiunto campo `fundamental?: string` all'interfaccia `Colpo`

2. **src/utils/analisi.ts**
   - Aggiunte interfacce `AnalisiFondamentalePerLato` e `AnalisiFondamentale`
   - Aggiunta funzione `calcolaAnalisiPerFondamentale()`
   - Aggiunto campo `perFondamentale` all'interfaccia `AnalisiGiocatore`
   - Aggiunto calcolo `perFondamentale` nella funzione `generaAnalisiCompleta()`

3. **src/components/ResocontoAnalisi.tsx**
   - Aggiunte due nuove sezioni per BAGHER e PALLEGGIO
   - Visualizzazione tabelle con evidenziazione top 3
   - Colori differenziati (verde per bagher, blu per palleggio)

4. **src/components/ResocontoAnalisi.css**
   - Aggiunti stili per `.resoconto-sezione-descrizione`
   - Aggiunto stile per `.cella-top3` (bordo verde)

## Build Status

✅ Build completato con successo
- 47 modules transformed
- dist/assets/index-BSc3mmG3.js: 585.52 kB (gzip: 183.10 kB)
- dist/assets/index-DKDG1uj6.css: 23.99 kB (gzip: 4.70 kB)

## Note Tecniche

### Perché non usare le soglie globali?

Le soglie globali sono progettate per valutare la **qualità** della ricezione (PP, ER, PE), non la **quantità** di esecuzioni per direzione. Per le tabelle BAGHER e PALLEGGIO, l'obiettivo è identificare le direzioni più frequenti, indipendentemente dalla qualità.

### Perché 3 direzioni?

Le 3 direzioni con più esecuzioni rappresentano il **pattern principale** del giocatore. Se un giocatore esegue il 70% dei bagher in 3 direzioni specifiche, quelle sono le direzioni su cui si concentra il suo allenamento.

### Separazione BAGHER vs PALLEGGIO

I due fondamentali hanno caratteristiche tecniche diverse:
- **BAGHER**: Tecnica di base, più frequente, colori verdi
- **PALLEGGIO**: Tecnica avanzata, meno frequente, colori blu

La separazione permette di analizzare separatamente le performance dei due fondamentali.

## Prossimi Sviluppi

1. **Grafici a barre**: Visualizzare le distribuzioni con grafici
2. **Confronto temporale**: Confrontare le distribuzioni tra sessioni diverse
3. **Soglie personalizzabili**: Permettere di configurare il numero di direzioni da evidenziare (es. top 5 invece di top 3)
4. **Export specifico**: Esportare solo le tabelle BAGHER/PALLEGGIO in formato CSV
