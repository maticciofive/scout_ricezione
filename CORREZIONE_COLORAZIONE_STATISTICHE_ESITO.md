# Correzione Colorazione Statistiche per Esito

## Problema Identificato

Nella tabella "Statistiche per Esito", i colori delle celle venivano calcolati individualmente per ogni esito (#, +, !, -, /, =), causando una visualizzazione errata quando la somma delle ricezioni positive o negative era significativa.

**Esempio del problema:**
- Ricezioni Perfette (#): 30% → colore arancione/rosso (errato!)
- Ricezioni Positive (+): 32% → colore arancione/rosso (errato!)
- **Somma totali positive: 62%** → dovrebbe essere verde (ottimo!)

Il problema era che ogni cella veniva colorata in base al proprio valore individuale, non alla somma complessiva degli esiti positivi o negativi.

## Soluzione Implementata

### Logica di Colorazione Corretta

Ora le celle vengono colorate in base alla **somma** degli esiti correlati:

#### Per Esiti Positivi (# e +)
- **Valore di colorazione**: Somma di # e +
- **Tipo esito**: 'positivo'
- **Esempio**: Se # = 30% e + = 32%, la somma è 62% → colore verde (ottimo)

#### Per Esiti Negativi (-, /, =)
- **Valore di colorazione**: Somma di -, / e =
- **Tipo esito**: 'negativo'
- **Esempio**: Se - = 10%, / = 5%, = = 3%, la somma è 18% → colore arancione (attenzione)

#### Per Esiti Neutri (!)
- **Valore di colorazione**: Valore individuale
- **Tipo esito**: 'positivo' (default)
- **Esempio**: Se ! = 15% → colore in base alle soglie configurate

### Codice Modificato

**Prima:**
```typescript
{OUTCOMES.map(o => (
  <td key={o.key} style={{ 
    ...tdStyle, 
    textAlign: 'center', 
    background: getHighlightBg(counts[o.key], total, getTipoEsito(o.key)) 
  }}>
    <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
    <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
  </td>
))}
```

**Dopo:**
```typescript
// Calcola somme per colorazione basata su totali
const sommaPositivi = (counts['#'] || 0) + (counts['+'] || 0);
const sommaNegativi = (counts['-'] || 0) + (counts['/'] || 0) + (counts['='] || 0);

{OUTCOMES.map(o => {
  // Determina il valore da usare per la colorazione
  let valoreColorazione = counts[o.key];
  let tipoEsito = getTipoEsito(o.key);
  
  // Per esiti positivi (# e +), usa la somma
  if (o.key === '#' || o.key === '+') {
    valoreColorazione = sommaPositivi;
    tipoEsito = 'positivo';
  }
  // Per esiti negativi (-, /, =), usa la somma
  else if (o.key === '-' || o.key === '/' || o.key === '=') {
    valoreColorazione = sommaNegativi;
    tipoEsito = 'negativo';
  }
  
  return (
    <td key={o.key} style={{ 
      ...tdStyle, 
      textAlign: 'center', 
      background: getHighlightBg(valoreColorazione, total, tipoEsito) 
    }}>
      <div style={{ fontWeight: 700 }}>{counts[o.key]}</div>
      <div style={{ fontSize: '10px', color: '#6b7280' }}>{pct(counts[o.key], total)}</div>
    </td>
  );
})}
```

## Tabelle Modificate

La correzione è stata applicata a tutte e tre le tabelle "Statistiche per Esito":

1. **Statistiche per Esito** (generale)
   - Righe 1367-1395 in App.tsx
   - Colorazione basata su somma per tutti i giocatori e squadra

2. **Statistiche per Esito - BAGHER**
   - Righe 1507-1576 in App.tsx
   - Colorazione basata su somma per fondamentale Bagher

3. **Statistiche per Esito - PALLEGGIO**
   - Righe 1597-1666 in App.tsx
   - Colorazione basata su somma per fondamentale Palleggio

## Esempio Pratico

### Scenario
Giocatore con 100 ricezioni totali:
- Perfette (#): 20 (20%)
- Positive (+): 42 (42%)
- Esclamative (!): 15 (15%)
- Negative (-): 10 (10%)
- Slash (/): 8 (8%)
- Errori (=): 5 (5%)

### Calcolo Somme
- **Somma Positivi** (# + +): 20 + 42 = 62 (62%)
- **Somma Negativi** (- + / + =): 10 + 8 + 5 = 23 (23%)

### Colorazione Corretta

| Esito | Valore | Somma Usata | Tipo | Colore |
|-------|--------|-------------|------|--------|
| # | 20 (20%) | 62 (62%) | positivo | 🟢 Verde (ottimo) |
| + | 42 (42%) | 62 (62%) | positivo | 🟢 Verde (ottimo) |
| ! | 15 (15%) | 15 (15%) | positivo | 🔴 Rosso (critico) |
| - | 10 (10%) | 23 (23%) | negativo | 🟡 Arancione (attenzione) |
| / | 8 (8%) | 23 (23%) | negativo | 🟡 Arancione (attenzione) |
| = | 5 (5%) | 23 (23%) | negativo | 🟡 Arancione (attenzione) |

### Interpretazione
- Le celle # e + sono entrambe verdi perché la somma totale (62%) è ottima
- Le celle -, /, = sono tutte arancioni perché la somma totale (23%) richiede attenzione
- La cella ! mantiene il colore basato sul proprio valore individuale (15%)

## Vantaggi della Correzione

1. **Visione d'Insieme**: I colori riflettono la performance complessiva, non i singoli valori
2. **Coerenza**: Celle correlate hanno colori coerenti tra loro
3. **Chiarezza**: È immediatamente evidente se la somma dei positivi/negativi è buona o critica
4. **Decisioni**: Facilita l'identificazione di aree di miglioramento

## Soglie di Colorazione

Le soglie configurabili nel pannello "Configurazione Soglie Globali" si applicano alle somme:

### Per Positivi (# + +)
- 🟢 **Verde**: Somma ≥ soglia verde (default 60%)
- 🟡 **Arancione**: Somma ≥ soglia arancione (default 45%)
- 🔴 **Rosso**: Somma < soglia arancione

### Per Negativi (- + / + =)
- 🟢 **Verde**: Somma ≤ soglia verde (default 10%)
- 🟡 **Arancione**: Somma ≤ soglia arancione (default 25%)
- 🔴 **Rosso**: Somma > soglia arancione

## Build Status

```
✓ 924 modules transformed
✓ dist/assets/index-D7Zfa1xV.js: 1,491.49 kB (gzip: 444.50 kB)
✓ built in 15.26s
```

**Build completato con successo!** ✅

## Note Tecniche

### Funzione getHighlightBg
La funzione `getHighlightBg(valore, totale, tipoEsito)` riceve:
- `valore`: Il valore da valutare (somma o singolo)
- `totale`: Il totale delle ricezioni
- `tipoEsito`: 'positivo' o 'negativo'

E restituisce il colore di sfondo in base alle soglie configurate.

### Funzione getTipoEsito
La funzione `getTipoEsito(o.key)` restituisce:
- 'positivo' per #, +, !
- 'negativo' per -, /, =
- 'errore' per = (sovrascritto dalla logica di somma)

### Compatibilità
- ✅ Funziona con tutte le soglie configurabili
- ✅ Mantiene la visualizzazione individuale dei valori
- ✅ Aggiorna solo la colorazione, non i dati mostrati
- ✅ Applicata a tutte e tre le tabelle statistiche

## Conclusioni

La correzione garantisce che la colorazione delle celle nelle tabelle "Statistiche per Esito" rifletta accuratamente la performance complessiva del giocatore, considerando la somma delle ricezioni positive e negative invece dei singoli valori. Questo fornisce una visualizzazione più coerente e utile per l'analisi delle performance.
