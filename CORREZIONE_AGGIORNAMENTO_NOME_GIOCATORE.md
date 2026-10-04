# Correzione Aggiornamento Nome Giocatore

## Problema Identificato

Quando un utente modificava il nome di un giocatore nella configurazione, il nuovo nome non veniva aggiornato in tutte le sezioni dell'applicazione. In particolare:

- ✅ **Sezioni che funzionavano correttamente**: Configurazione giocatori, campo da gioco, statistiche (usano `players[index].name`)
- ❌ **Sezioni con problema**: Storico ricezioni, export CSV, export Excel (usavano `r.playerName` salvato)

## Causa del Problema

Quando una ricezione viene salvata, il nome del giocatore viene memorizzato come stringa fissa nel campo `playerName`:

```typescript
const rec: Reception = {
  // ...
  playerName: player.name,  // Nome salvato al momento della ricezione
  playerIndex: selectedPlayerIdx,  // Indice del giocatore
  // ...
};
```

Se l'utente successivamente cambia il nome del giocatore nella configurazione, le ricezioni già salvate continuano a contenere il vecchio nome nel campo `playerName`.

## Soluzione Implementata

Invece di usare il campo `playerName` salvato, ora l'applicazione recupera il nome attuale del giocatore usando `playerIndex`:

```typescript
// Prima (ERRATO)
<td>{r.playerName}</td>

// Dopo (CORRETTO)
<td>{players[r.playerIndex]?.name || r.playerName}</td>
```

Il fallback `|| r.playerName` garantisce che se per qualche motivo il `playerIndex` non è valido, venga comunque mostrato il nome salvato.

## File Modificati

### src/App.tsx

**1. Storico Ricezioni (riga 1272)**
```typescript
// Prima
<td style={tdStyle}>{r.playerName}</td>

// Dopo
<td style={tdStyle}>{players[r.playerIndex]?.name || r.playerName}</td>
```

**2. Export CSV (riga 292)**
```typescript
// Prima
[r.playerName, r.zone, r.side, ...]

// Dopo
[players[r.playerIndex]?.name || r.playerName, r.zone, r.side, ...]
```

**3. Export Excel (riga 409)**
```typescript
// Prima
html += `<td>${r.playerName}</td>`;

// Dopo
html += `<td>${players[r.playerIndex]?.name || r.playerName}</td>`;
```

## Sezioni Aggiornate Automaticamente

Le seguenti sezioni usano già `players[index].name` e quindi si aggiornano automaticamente:

- ✅ Configurazione giocatori
- ✅ Campo da gioco (marker dei giocatori)
- ✅ Statistiche per esito (tutte le tabelle)
- ✅ Punto di ricezione per lato
- ✅ Resoconto analisi completa
- ✅ Analisi multi-giornata (file esterni)

## Vantaggi della Soluzione

1. **Coerenza**: Il nome del giocatore è sempre aggiornato in tutta l'applicazione
2. **Retrocompatibilità**: Il fallback `|| r.playerName` garantisce che le vecchie ricezioni continuino a funzionare
3. **Semplicità**: Non è necessario migrare i dati esistenti
4. **Performance**: L'operazione di lookup è O(1)

## Esempio Pratico

### Scenario
1. Utente crea "Giocatore 1" e registra 10 ricezioni
2. Utente rinomina "Giocatore 1" in "Mario Rossi"
3. Utente registra altre 5 ricezioni

### Risultato
- **Prima della correzione**: 
  - Le prime 10 ricezioni mostrano "Giocatore 1"
  - Le ultime 5 ricezioni mostrano "Mario Rossi"
  - Incoerenza nei dati

- **Dopo la correzione**:
  - Tutte le 15 ricezioni mostrano "Mario Rossi"
  - Coerenza totale

## Build Status

✅ Build completato con successo (571.27 kB gzipped: 179.63 kB)

## Note Tecniche

### Perché non aggiornare i dati esistenti?

Aggiornare tutte le ricezioni esistenti ogni volta che un nome cambia avrebbe diversi svantaggi:

1. **Performance**: Operazione O(n) su tutte le ricezioni
2. **Complessità**: Necessità di gestire transazioni e rollback
3. **Storico**: Perderembe la traccia del nome originale al momento della ricezione
4. **Rischio errori**: Possibile corruzione dei dati

La soluzione attuale (lookup dinamico) è più semplice, performante e sicura.

### Gestione Edge Cases

```typescript
players[r.playerIndex]?.name || r.playerName
```

- `players[r.playerIndex]` potrebbe essere `undefined` se il giocatore è stato rimosso
- `?.name` usa optional chaining per evitare errori
- `|| r.playerName` fornisce un fallback sicuro

Questo garantisce che l'applicazione non crashi mai anche in casi limite.
