# Aggiornamento Tabella Direzione × Esito per Lato - Analisi per Giocatore

## Panoramica

La tabella "Corrispondenza Direzione × Esito per Lato" è stata aggiornata per permettere l'analisi dei dati per singolo giocatore, oltre alla visualizzazione aggregata di tutti i giocatori.

## Modifiche Effettuate

### 1. Nuovo Filtro per Giocatore

**File**: `src/components/TabellaDirezioneEsito.tsx`

Aggiunto un nuovo stato per gestire la selezione del giocatore:

```typescript
const [giocatoreSelezionato, setGiocatoreSelezionato] = useState<string>('tutti');
```

### 2. UI Aggiornata

Aggiunto un nuovo select nell'header della tabella per filtrare per giocatore:

```tsx
<div className="tabella-direzione-esito-filtro">
  <label htmlFor="giocatore-select">Giocatore:</label>
  <select
    id="giocatore-select"
    value={giocatoreSelezionato}
    onChange={(e) => setGiocatoreSelezionato(e.target.value)}
    className="tabella-direzione-esito-select"
  >
    <option value="tutti">Tutti i giocatori</option>
    {giocatori.map((giocatore, index) => (
      <option key={giocatore.id} value={index.toString()}>
        {giocatore.name}
      </option>
    ))}
  </select>
</div>
```

### 3. Logica di Filtraggio Aggiornata

La funzione `filtraColpiPerLato` è stata modificata per considerare anche il filtro per giocatore:

```typescript
const filtraColpiPerLato = (lati: string[]) => {
  return colpi.filter(c => {
    // Filtro per giocatore
    if (giocatoreSelezionato !== 'tutti' && c.playerIndex !== parseInt(giocatoreSelezionato)) {
      return false;
    }
    
    // Filtro per lato del campo
    if (lati.length === 0) return true;
    
    // Trova il lato del campo in base alla zona del giocatore
    const giocatore = giocatori[c.playerIndex];
    if (!giocatore) return false;
    
    // La zona del giocatore determina il lato
    const zonaGiocatore = giocatore.zone;
    return lati.some(lato => {
      const latoDef = LATI_CAMPO.find(l => l.nome === lato);
      return latoDef && latoDef.zone.includes(zonaGiocatore);
    });
  });
};
```

### 4. Titolo Dinamico

Il titolo di ogni sezione ora mostra il nome del giocatore selezionato:

```typescript
const nomeGiocatore = giocatoreSelezionato === 'tutti' 
  ? 'Tutti i giocatori'
  : giocatori[parseInt(giocatoreSelezionato)]?.name || 'Giocatore sconosciuto';

<h3 className="tabella-lato-titolo">
  {lato.descrizione} - {nomeGiocatore}
  <span className="tabella-lato-totale">
    Totale: {totaleLato} ricezioni
  </span>
</h3>
```

### 5. CSS Aggiornato

**File**: `src/components/TabellaDirezioneEsito.css`

Aggiunto stile per il container dei filtri:

```css
.tabella-direzione-esito-filtri {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 768px) {
  .tabella-direzione-esito-filtri {
    flex-direction: row;
    gap: 16px;
  }
}
```

## Funzionalità

### Modalità di Visualizzazione

1. **Tutti i giocatori**: Mostra le statistiche aggregate di tutti i giocatori per ogni lato
2. **Giocatore specifico**: Mostra le statistiche del singolo giocatore selezionato per ogni lato

### Combinazione Filtri

I due filtri (giocatore e lato) possono essere combinati:

- **Tutti i giocatori + Tutti i lati**: Visualizzazione completa aggregata
- **Tutti i giocatori + Lato specifico**: Statistiche aggregate per un lato specifico
- **Giocatore specifico + Tutti i lati**: Statistiche del giocatore per tutti i lati
- **Giocatore specifico + Lato specifico**: Statistiche del giocatore per un lato specifico

## Esempio d'Uso

### Scenario 1: Analisi Aggregata
- **Giocatore**: "Tutti i giocatori"
- **Lato**: "Tutti i lati"
- **Risultato**: Tabella completa con tutte le ricezioni di tutti i giocatori

### Scenario 2: Analisi per Giocatore
- **Giocatore**: "Mario Rossi"
- **Lato**: "Tutti i lati"
- **Risultato**: Tre tabelle (Destra, Centro, Sinistra) con solo le ricezioni di Mario Rossi

### Scenario 3: Analisi Specifica
- **Giocatore**: "Mario Rossi"
- **Lato**: "Destra (1-9-2)"
- **Risultato**: Una sola tabella con le ricezioni di Mario Rossi nel lato destro

## Vantaggi

1. **Analisi Individuale**: Permette di identificare pattern specifici di ogni giocatore
2. **Confronto**: Facilita il confronto tra giocatori diversi
3. **Allenamento Mirato**: I coach possono creare esercizi specifici basati sui dati individuali
4. **Flessibilità**: Combinazione di filtri per analisi dettagliate

## Struttura Dati

### Esempio Output

**Giocatore**: Mario Rossi  
**Lato**: Destra (1-9-2)  
**Totale**: 20 ricezioni

| Direzione | # | + | ! | - | / | = |
|-----------|---|---|---|---|---|---|
| ▲ Avanti | 2 (40%) | 2 (40%) | 1 (20%) | 0 (0%) | 0 (0%) | 0 (0%) |
| ▶ Destro | 3 (37.5%) | 3 (37.5%) | 1 (12.5%) | 1 (12.5%) | 0 (0%) | 0 (0%) |
| ● Corpo | 1 (25%) | 2 (50%) | 1 (25%) | 0 (0%) | 0 (0%) | 0 (0%) |
| ▼ Dietro | 0 (0%) | 1 (33.3%) | 1 (33.3%) | 1 (33.3%) | 0 (0%) | 0 (0%) |

### Interpretazione

- **Avanti**: 40% perfette, 40% positive → buona performance
- **Destro**: 37.5% perfette, 37.5% positive, 12.5% esclamative, 12.5% negative → performance accettabile
- **Corpo**: 25% perfette, 50% positive, 25% esclamative → performance buona
- **Dietro**: 33.3% positive, 33.3% esclamative, 33.3% negative → performance critica

## Build Status

✅ Build completato con successo
- 45 modules transformed
- dist/assets/index-Cdxt_FL2.js: 581.38 kB (gzip: 182.09 kB)
- dist/assets/index-CF1CqV1c.css: 21.54 kB (gzip: 4.06 kB)

## File Modificati

1. **src/components/TabellaDirezioneEsito.tsx**
   - Aggiunto stato `giocatoreSelezionato`
   - Modificata funzione `filtraColpiPerLato` per filtrare per giocatore
   - Aggiunto select per giocatore nell'header
   - Aggiornato titolo dinamico con nome giocatore

2. **src/components/TabellaDirezioneEsito.css**
   - Aggiunto stile per `.tabella-direzione-esito-filtri`
   - Layout responsive per i filtri

## Note Tecniche

### Perché usare l'index invece dell'ID?

I colpi salvati contengono `playerIndex` (l'indice nell'array dei giocatori), non `player.id`. Per questo motivo, il filtro usa l'index per garantire la coerenza con i dati salvati.

### Gestione Edge Cases

- **Giocatore non trovato**: Mostra "Giocatore sconosciuto" nel titolo
- **Nessuna ricezione**: Mostra messaggio "Nessuna ricezione registrata per questo lato"
- **Percentuale zero**: Cella con background trasparente

## Prossimi Sviluppi Possibili

1. **Export per giocatore**: Permettere di esportare i dati del singolo giocatore
2. **Confronto giocatori**: Modalità per confrontare due o più giocatori
3. **Grafici individuali**: Grafici specifici per ogni giocatore
4. **Filtri aggiuntivi**: Filtri per fondamentale (bagher/palleggio) o tipo di battuta
