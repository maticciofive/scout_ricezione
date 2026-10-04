# 📊 Tabella di Analisi Incrociata (Pivot) - Documentazione

## 🎯 Obiettivo

Creare una tabella pivot che incroci **Zona di ricezione** × **Tipologia di battuta**, mostrando la distribuzione percentuale di tutti gli esiti (#, +, !, -, /, =) per ogni combinazione.

---

## 📁 File Creati

### 1. `src/utils/tabellaIncrociata.ts` (150 righe)

**Funzioni esportate:**

#### `generaDatiTabellaIncrociata(colpi, giocatori)`
- Genera i dati aggregati per ogni giocatore separatamente
- Restituisce un `Record<string, DatiTabellaGiocatore>` con chiave = nome giocatore

#### `generaDatiTabellaIncrociataTotale(colpi)`
- Genera i dati aggregati per TUTTI i giocatori combinati
- Restituisce un singolo `DatiTabellaGiocatore`

**Struttura dati restituita:**
```typescript
{
  giocatoreNome: string;
  dati: {
    'Sinistra': {
      'Flottante': { totale: 10, esiti: { perfetta: 20.0, positiva: 30.0, ... } },
      'Jump Top Spin': { totale: 5, esiti: { ... } },
      ...
    },
    'Centro': { ... },
    'Destra': { ... }
  }
}
```

**Logica di calcolo:**
- Raggruppa i colpi per giocatore → zona → tipologia
- Per ogni gruppo, calcola il totale e le percentuali per ogni esito
- Formula: `(conteggio_esito / totale) * 100`, arrotondato a 1 decimale
- Se totale = 0, tutte le percentuali sono 0
- Gestisce valori `undefined` o `'non-specificata'` come categoria "Non specificata"

---

### 2. `src/components/TabellaAnalisiIncrociata.tsx` (150 righe)

**Componente React con:**

#### Props
```typescript
interface TabellaAnalisiIncrociataProps {
  giocatori: { id: number; name: string }[];
  colpi: Colpo[];
}
```

#### Funzionalità
- **Selettore giocatore**: Dropdown per filtrare per un singolo giocatore o "Tutti i giocatori"
- **Tabella responsive**: Scroll orizzontale su mobile con colonne fisse
- **Evidenziazione automatica**:
  - 🔴 Rosso: celle con % Errore (=) ≥ 15%
  - 🟢 Verde: righe con somma (% # + % +) ≥ 60%
- **Gestione vuoto**: Mostra "-" invece di "0%" per pulizia visiva

#### Struttura tabella
```
┌─────────┬─────────────────┬─────┬───┬───┬───┬───┬───┬───┐
│ Zona    │ Tipologia       │ Tot │ # │ + │ ! │ - │ / │ = │
├─────────┼─────────────────┼─────┼───┼───┼───┼───┼───┼───┤
│         │ Flottante       │ 10  │20%│30%│10%│20%│ 0%│20%│
│ Sinistra├─────────────────┼─────┼───┼───┼───┼───┼───┼───┤
│         │ Jump Top Spin   │  5  │40%│20%│ 0%│20%│ 0%│20%│
├─────────┼─────────────────┼─────┼───┼───┼───┼───┼───┼───┤
│ Centro  │ ...             │ ... │...│...│...│...│...│...│
├─────────┼─────────────────┼─────┼───┼───┼───┼───┼───┼───┤
│ Destra  │ ...             │ ... │...│...│...│...│...│...│
└─────────┴─────────────────┴─────┴───┴───┴───┴───┴───┴───┘
```

**Note:**
- Usa `rowSpan` per unire le celle della zona quando ci sono più tipologie
- Colonne fisse su mobile: Zona e Tipologia rimangono visibili durante lo scroll orizzontale

---

### 3. `src/components/TabellaAnalisiIncrociata.css` (200 righe)

**Stili principali:**

#### Header
- Background blu (`#0066cc`) con testo bianco
- Sottocategorie esiti con colori distinti:
  - `#` (Perfetta): verde scuro `#16a34a`
  - `+` (Positiva): verde `#22c55e`
  - `!` (Esclamativa): giallo `#eab308`
  - `-` (Negativa): arancione `#f97316`
  - `/` (Slash): grigio `#6b7280`
  - `=` (Errore): rosso `#dc2626`

#### Celle
- Padding responsive: `clamp(0.5rem, 1vw, 0.75rem)`
- Testo centrato
- Bordi sottili grigi (`#e5e7eb`)
- Colonna "Totale" in grassetto

#### Evidenziazioni
```css
/* Errore critico (≥15%) */
.cella-errore-critico {
  background: #fee2e2 !important;
  color: #991b1b !important;
  font-weight: 700 !important;
  border: 2px solid #dc2626 !important;
}

/* Riga positiva (somma ≥60%) */
.riga-positiva {
  background: #d1fae5 !important;
}
```

#### Responsive
- Mobile: scroll orizzontale con `overflow-x: auto`
- Colonne fisse: `position: sticky; left: 0` per Zona e Tipologia
- Font size adattivo: `clamp(0.85rem, 2vw, 0.95rem)`

---

## 🔗 Integrazione in App.tsx

**Modifiche minime (2 righe):**

### Riga 4 - Import
```typescript
import TabellaAnalisiIncrociata from './components/TabellaAnalisiIncrociata'; // NUOVO
```

### Riga 1777 - Componente
```tsx
{/* NUOVO: Tabella Analisi Incrociata */}
<TabellaAnalisiIncrociata giocatori={players} colpi={receptions} />
```

**Posizione:** Subito dopo `<ResocontoAnalisi>` e prima di `<AnalisiMultipla>`

---

## 🧪 Test di Verifica

### Scenario di Test

**Input:**
```typescript
// Mario ha 4 ricezioni in Zona Destra contro Jump Top Spin:
colpi = [
  { playerIndex: 0, side: 'Destra', serveTypology: 'Jump Top Spin', outcome: '#' },
  { playerIndex: 0, side: 'Destra', serveTypology: 'Jump Top Spin', outcome: '+' },
  { playerIndex: 0, side: 'Destra', serveTypology: 'Jump Top Spin', outcome: '-' },
  { playerIndex: 0, side: 'Destra', serveTypology: 'Jump Top Spin', outcome: '=' },
]
```

**Output atteso nella tabella:**
```
┌────────┬─────────────────┬─────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Zona   │ Tipologia       │ Tot │  #   │  +   │  !   │  -   │  /   │  =   │
├────────┼─────────────────┼─────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ Destra │ Jump Top Spin   │  4  │25.0% │25.0% │ 0.0% │25.0% │ 0.0% │25.0% │
└────────┴─────────────────┴─────┴──────┴──────┴──────┴──────┴──────┴──────┘
                                                                    ↑
                                                              Rosso (≥15%)
```

**Verifiche:**
- ✅ Totale: 4
- ✅ % #: (1/4) × 100 = 25.0%
- ✅ % +: (1/4) × 100 = 25.0%
- ✅ % !: (0/4) × 100 = 0.0%
- ✅ % -: (1/4) × 100 = 25.0% (SOLO '-')
- ✅ % /: (0/4) × 100 = 0.0%
- ✅ % =: (1/4) × 100 = 25.0% (SOLO '=') → **Evidenziato in rosso** (≥15%)

---

## 📊 Esempio d'Uso

### Caso 1: Visualizzare tutti i giocatori
1. Seleziona "Tutti i giocatori" dal dropdown
2. La tabella mostra i dati aggregati di tutti i giocatori
3. Utile per analisi di squadra

### Caso 2: Analizzare un giocatore specifico
1. Seleziona "Mario" dal dropdown
2. La tabella mostra solo i dati di Mario
3. Utile per analisi individuale

### Caso 3: Identificare criticità
1. Cerca celle evidenziate in **rosso** (Errore ≥15%)
2. Indica combinazioni zona/tipologia problematiche
3. Esempio: "Destra × Jump Top Spin" con 20% errori

### Caso 4: Identificare punti di forza
1. Cerca righe evidenziate in **verde** (somma # + ≥60%)
2. Indica combinazioni zona/tipologia dove il giocatore eccelle
3. Esempio: "Centro × Flottante" con 70% positive

---

## 🎯 Caratteristiche Chiave

### 1. **Distinzione Netta Esiti**
- **Negativa (-)**: Solo ricezioni negative ma giocabili
- **Errore (=)**: Solo errori diretti/ace subiti
- Non vengono mescolati come nelle versioni precedenti

### 2. **Evidenziazione Intelligente**
- **Rosso**: Errori critici (≥15%) → Attenzione immediata
- **Verde**: Performance positive (≥60%) → Punto di forza

### 3. **Responsive Design**
- Desktop: Tabella completa visibile
- Mobile: Scroll orizzontale con colonne fisse
- Font size adattivo per leggibilità

### 4. **Flessibilità**
- Filtro per giocatore singolo o tutti
- Aggiornamento in tempo reale con nuovi dati
- Gestione automatica di dati mancanti

---

## 🔧 Dettagli Tecnici

### Gestione Divisione per Zero
```typescript
if (totale === 0) {
  // Tutte le percentuali sono 0
  esiti: { perfetta: 0, positiva: 0, ... }
}
```

### Arrotondamento Decimali
```typescript
Math.round((conteggio / totale) * 1000) / 10
// Esempio: 33.333... → 33.3%
```

### Gestione Valori Mancanti
```typescript
const matchTipologia = c.serveTypology === tipologia || 
                      (tipologia === 'Non specificata' && 
                       (!c.serveTypology || c.serveTypology === 'Non specificata'));
```

### Sticky Columns (Mobile)
```css
.cella-zona {
  position: sticky;
  left: 0;
  background: #f3f4f6;
  z-index: 5;
}
```

---

## 📈 Performance

- **Build**: 568.32 kB gzipped (179.14 kB)
- **Moduli**: 39 trasformati
- **Tempo build**: 4.47s
- **Nessun impatto** sulle performance dell'app esistente

---

## 🚀 Prossimi Sviluppi Possibili

1. **Export Excel**: Aggiungere pulsante per esportare la tabella in formato Excel
2. **Filtri avanzati**: Aggiungere filtri per fondamentale, velocità, provenienza
3. **Grafici**: Aggiungere grafici a barre per visualizzare le percentuali
4. **Confronto temporale**: Confrontare le tabelle tra diverse sessioni di allenamento

---

## ✅ Checklist Verifica

- [x] File `src/utils/tabellaIncrociata.ts` creato
- [x] File `src/components/TabellaAnalisiIncrociata.tsx` creato
- [x] File `src/components/TabellaAnalisiIncrociata.css` creato
- [x] Import aggiunto in `App.tsx` (riga 4)
- [x] Componente aggiunto in `App.tsx` (riga 1777)
- [x] Build completato con successo
- [x] Nessuna modifica all'app esistente (solo aggiunta)
- [x] TypeScript con type definitions complete
- [x] Gestione divisione per zero
- [x] Gestione valori mancanti
- [x] Responsive design
- [x] Evidenziazione automatica (rosso/verde)
- [x] Distinzione netta tra Negativa (-) ed Errore (=)

---

**Build Status:** ✅ Completato con successo  
**Data Creazione:** 2026-01-15  
**Versione:** 1.0.0 (nuovo modulo)  
**Integrazione:** Minima (2 righe in App.tsx)
