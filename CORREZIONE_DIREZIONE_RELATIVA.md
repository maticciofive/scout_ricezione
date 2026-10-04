# Correzione Logica Direzione Relativa Battuta

## Problema Identificato

La funzione `calcolaDirezioneRelativa()` aveva una logica errata nella mappatura delle direzioni della battuta rispetto alla posizione del giocatore in campo.

### Errore Precedente

**Logica sbagliata:**
- Giocatore in Zona Destra + Zona 5 → "dalla sua sinistra (diagonale)" ❌
- Giocatore in Zona Destra + Zona 1 → "parallela" ❌
- Giocatore in Zona Sinistra + Zona 1 → "dalla sua destra" ❌

### Correzione Applicata

**Logica corretta (prospettiva del ricevitore):**

#### Giocatore in Zona Sinistra (4, 7, 5)
- Zona 1 → **parallela** (Zona 1 è di fronte alla sinistra)
- Zona 5 → **dalla sua destra (diagonale)** (Zona 5 arriva in diagonale da destra)
- Zona 6 → **dalla sua destra (diagonale)** (Zona 6 arriva in diagonale da destra)

#### Giocatore in Zona Centro (3, 8, 6)
- Zona 1 → **dalla sua sinistra (diagonale)** (Zona 1 arriva in diagonale da sinistra)
- Zona 5 → **dalla sua destra (diagonale)** (Zona 5 arriva in diagonale da destra)
- Zona 6 → **parallela (frontale)** (Zona 6 è di fronte al centro)

#### Giocatore in Zona Destra (2, 9, 1)
- Zona 1 → **dalla sua sinistra (diagonale)** (Zona 1 arriva in diagonale da sinistra)
- Zona 5 → **parallela** (Zona 5 è di fronte alla destra)
- Zona 6 → **dalla sua sinistra (diagonale)** (Zona 6 arriva in diagonale da sinistra)

## Visualizzazione Campo

```
        RETE
   ┌────┬────┬────┐
   │  4 │  3 │  2 │  ← Zona Battuta (lato avversario)
   ├────┼────┼────┤
   │  7 │  8 │  9 │
   ├────┼────┼────┤
   │  5 │  6 │  1 │  ← Zona Ricezione (lato nostro)
   └────┴────┴────┘
   
   Sinistra  Centro  Destra
   (4,7,5)   (3,8,6) (2,9,1)
```

### Prospettiva del Ricevitore

Dal punto di vista del ricevitore che guarda verso la rete:
- **Zona 1** = a SINISTRA del ricevitore
- **Zona 6** = al CENTRO (frontale)
- **Zona 5** = a DESTRA del ricevitore

## Esempi Pratici

### Esempio 1: Giocatore in Zona Destra
**Scenario:** Giocatore posizionato in Zona Destra (2, 9, 1), battuta dalla Zona 5

**Risultato corretto:**
```
Criticità in Zona Destra del campo.
La palla arriva parallela (da Zona 5).
RACCOMANDAZIONE: L'atleta deve lavorare specificamente sul lato destro del corpo...
```

### Esempio 2: Giocatore in Zona Sinistra
**Scenario:** Giocatore posizionato in Zona Sinistra (4, 7, 5), battuta dalla Zona 6

**Risultato corretto:**
```
Criticità in Zona Sinistra del campo.
La palla arriva dalla sua destra (diagonale) (da Zona 6).
RACCOMANDAZIONE: L'atleta deve lavorare specificamente sul lato sinistro del corpo...
```

### Esempio 3: Giocatore in Zona Centro
**Scenario:** Giocatore posizionato in Zona Centro (3, 8, 6), battuta dalla Zona 6

**Risultato corretto:**
```
Criticità in Zona Centro del campo.
La palla arriva parallela (frontale) (da Zona 6).
RACCOMANDAZIONE: L'atleta deve lavorare specificamente sul lato centrale del corpo...
```

## File Modificato

**src/utils/metriche.ts**
- Funzione: `calcolaDirezioneRelativa(zonaGiocatore: string, zonaBattuta: number): string`
- Correzione logica mappatura zone
- Aggiornamento documentazione JSDoc

## Build Status

✅ Build completato con successo (571.09 kB gzipped: 179.53 kB)

## Impatto sul Resoconto

Questa correzione garantisce che le raccomandazioni nel resoconto analitico siano **spazialmente corrette**, fornendo al giocatore indicazioni precise su:
- Da quale direzione arriva la palla problematica
- Su quale lato del corpo lavorare
- Quale zona di battuta allenare specificamente

Esempio di resoconto corretto:
```
Giocatore 1 ha un'efficienza del 0% (Insufficiente). La percentuale positiva è del 0%. 
Ricezioni negative (giocabili ma difficili): 80.0%. 
Criticità in Zona Destra del campo. 
La palla arriva parallela (da Zona 5). 
RACCOMANDAZIONE: L'atleta deve lavorare specificamente sul lato destro del corpo 
per migliorare la stabilità su ricezioni difficili. 
Focus sulla battuta dalla Zona 5.
```
