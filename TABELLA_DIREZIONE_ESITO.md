# Tabella Direzione × Esito per Lato

## Panoramica

Nuovo componente che mostra la corrispondenza tra la direzione della palla rispetto al corpo del giocatore (avanti, dietro, sinistro, destro, corpo) e l'esito della ricezione (#, +, !, -, /, =), organizzato per lato del campo.

## Funzionalità

### 1. **Filtro per Lato del Campo**
- **Destra (1-9-2)**: Ricezioni effettuate nella metà destra del campo
- **Centro (6-8-3)**: Ricezioni effettuate nella zona centrale
- **Sinistra (5-7-4)**: Ricezioni effettuate nella metà sinistra del campo
- **Tutti i lati**: Visualizzazione combinata di tutti i lati

### 2. **Struttura della Tabella**

Per ogni lato selezionato viene mostrata una tabella con:

**Righe**: 5 direzioni della palla rispetto al corpo
- ▲ Avanti (up)
- ▼ Dietro (down)
- ◀ Sinistro (left)
- ▶ Destro (right)
- ● Corpo (center)

**Colonne**: 6 esiti della ricezione
- # Perfetta (verde)
- + Positiva (verde chiaro)
- ! Esclamativa (giallo)
- - Negativa (arancione)
- / Slash (grigio)
- = Errore (rosso)

**Celle**: Per ogni combinazione direzione × esito
- Numero assoluto di ricezioni
- Percentuale sul totale delle ricezioni in quella direzione

### 3. **Visualizzazione Dati**

Ogni cella mostra:
```
3
15.0%
```
Dove:
- **3** = numero di ricezioni con quella direzione e quell'esito
- **15.0%** = percentuale rispetto al totale delle ricezioni in quella direzione

### 4. **Evidenziazione Visiva**

- Le celle con valori > 0% hanno un background colorato in base all'esito
- L'intensità del colore è proporzionale alla percentuale
- Facilita l'identificazione visiva dei pattern

## Architettura

### File Creati

1. **src/components/TabellaDirezioneEsito.tsx**
   - Componente React principale
   - Logica di filtraggio e calcolo statistiche
   - Rendering delle tabelle per ogni lato

2. **src/components/TabellaDirezioneEsito.css**
   - Stili responsive
   - Layout adattivo per mobile e desktop
   - Colori coerenti con il resto dell'app

### Integrazione in App.tsx

**Import aggiunto** (linea 8):
```typescript
import TabellaDirezioneEsito from './components/TabellaDirezioneEsito'; // NUOVO - Tabella Direzione × Esito per Lato
```

**Componente aggiunto** (dopo TabellaAnalisiIncrociata):
```tsx
{/* NUOVO: Tabella Direzione × Esito per Lato */}
<TabellaDirezioneEsito giocatori={players} colpi={receptions} />
```

## Logica di Funzionamento

### 1. **Filtraggio per Lato**

```typescript
const filtraColpiPerLato = (lati: string[]) => {
  return colpi.filter(c => {
    const giocatore = giocatori[c.playerIndex];
    if (!giocatore) return false;
    
    const zonaGiocatore = giocatore.zone;
    return lati.some(lato => {
      const latoDef = LATI_CAMPO.find(l => l.nome === lato);
      return latoDef && latoDef.zone.includes(zonaGiocatore);
    });
  });
};
```

La funzione:
- Prende i colpi filtrati per lato
- Per ogni colpo, trova il giocatore che lo ha eseguito
- Verifica se la zona del giocatore appartiene al lato selezionato
- Restituisce solo i colpi che soddisfano il criterio

### 2. **Calcolo Statistiche**

```typescript
const calcolaStatistiche = (colpiFiltrati: Colpo[]) => {
  const stats: Record<string, Record<string, { count: number; percentage: number }>> = {};
  
  DIREZIONI_CORPO.forEach(dir => {
    stats[dir.key] = {};
    const colpiDirezione = colpiFiltrati.filter(c => c.direction === dir.key);
    const totaleDirezione = colpiDirezione.length;
    
    ESITI.forEach(esito => {
      const count = colpiDirezione.filter(c => c.outcome === esito.key).length;
      const percentage = totaleDirezione > 0 ? (count / totaleDirezione) * 100 : 0;
      stats[dir.key][esito.key] = { count, percentage };
    });
  });
  
  return stats;
};
```

La funzione:
- Per ogni direzione, filtra i colpi che hanno quella direzione
- Per ogni esito, conta quanti colpi hanno quell'esito
- Calcola la percentuale rispetto al totale della direzione
- Restituisce una matrice direzione × esito con count e percentage

### 3. **Mappatura Zone → Lati**

```typescript
const LATI_CAMPO = [
  { nome: 'Destra', zone: [1, 9, 2], descrizione: 'Lato destro del campo (1-9-2)' },
  { nome: 'Centro', zone: [6, 8, 3], descrizione: 'Lato centrale del campo (6-8-3)' },
  { nome: 'Sinistra', zone: [5, 7, 4], descrizione: 'Lato sinistro del campo (5-7-4)' },
];
```

Le zone del campo sono mappate ai lati secondo la numerazione standard della pallavolo:
- **Destra**: zone 1, 9, 2 (dal basso verso l'alto)
- **Centro**: zone 6, 8, 3 (dal basso verso l'alto)
- **Sinistra**: zone 5, 7, 4 (dal basso verso l'alto)

## Esempio d'Uso

### Scenario
Un giocatore ha ricevuto 20 palle nel lato destro del campo:
- 5 palle sono arrivate avanti (up)
- 8 palle sono arrivate a destra (right)
- 4 palle sono arrivate al corpo (center)
- 3 palle sono arrivate dietro (down)

### Risultato nella Tabella

**Lato Destra (1-9-2) - Totale: 20 ricezioni**

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

## Vantaggi

1. **Analisi Dettagliata**: Permette di identificare pattern specifici (es. "il giocatore ha difficoltà con palle che arrivano dietro nel lato destro")

2. **Visualizzazione Chiara**: Tabelle separate per ogni lato facilitano il confronto

3. **Flessibilità**: Possibilità di filtrare per lato specifico o visualizzare tutti

4. **Responsive**: Funziona su desktop e mobile con layout adattivo

5. **Integrazione Minimale**: Solo 2 righe aggiunte in App.tsx

## Build Status

✅ Build completato con successo
- 45 modules transformed
- dist/assets/index-BhZGlCQL.js: 580.70 kB (gzip: 181.96 kB)
- dist/assets/index-DrKqbh4M.css: 21.38 kB (gzip: 4.05 kB)

## Note Tecniche

### Perché questa tabella è utile?

1. **Identifica punti deboli specifici**: Se un giocatore ha molte ricezioni negative quando la palla arriva "dietro" nel "lato destro", si può lavorare su quella situazione specifica

2. **Analisi tattica**: Permette di capire se ci sono pattern nella distribuzione delle ricezioni (es. "il giocatore riceve più palle avanti nel lato sinistro")

3. **Allenamento mirato**: I coach possono usare questi dati per creare esercizi specifici

### Differenze rispetto ad altre tabelle

- **TabellaAnalisiIncrociata**: Incrocia Zona × Tipologia battuta
- **TabellaDirezioneEsito**: Incrocia Direzione palla × Esito ricezione per lato

Le due tabelle sono complementari e forniscono analisi diverse ma ugualmente utili.

## Prossimi Sviluppi Possibili

1. **Export in CSV/Excel**: Permettere di esportare i dati di questa tabella
2. **Grafici**: Aggiungere grafici a barre per visualizzare le percentuali
3. **Confronto giocatori**: Permettere di confrontare le performance di più giocatori
4. **Filtri aggiuntivi**: Aggiungere filtri per fondamentale (bagher/palleggio) o tipo di battuta
