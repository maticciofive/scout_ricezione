# 📝 Miglioramento Resoconto Analitico - Direzione Relativa Battuta

## 🎯 Obiettivo

Migliorare il resoconto analitico includendo informazioni sulla **direzione relativa della battuta** rispetto al giocatore, per fornire raccomandazioni più precise e azionabili.

---

## 🐛 Problema Precedente

Il resoconto mostrava informazioni generiche sulla zona critica ma non specificava:
- Da dove arriva la battuta (zona 1, 5, 6)
- La direzione relativa rispetto al giocatore (sinistra, destra, parallela)
- Raccomandazioni specifiche sulla provenienza

**Esempio precedente:**
```
Giocatore 1 ha un'efficienza del 0% (Insufficiente). La percentuale positiva è del 0%. 
Ricezioni negative (giocabili ma difficili): 80.0%. 
Criticità in Zona Destra. 
RACCOMANDAZIONE: L'atleta deve lavorare specificamente sul lato destro del corpo per migliorare la stabilità su ricezioni difficili.
```

**Mancava:**
- ❌ Informazioni sulla provenienza della battuta
- ❌ Direzione relativa (da sinistra, parallela, da destra)
- ❌ Focus specifico sulla zona di battuta critica

---

## ✅ Soluzione Implementata

### 1. Nuova Funzione: `calcolaDirezioneRelativa()`

**File:** `src/utils/metriche.ts`

```typescript
/**
 * Calcola la direzione relativa della battuta rispetto al giocatore
 * @param zonaGiocatore - Zona dove si trova il giocatore (Sinistra/Centro/Destra)
 * @param zonaBattuta - Zona da cui arriva la battuta (1/5/6)
 * @returns Descrizione della direzione relativa
 */
export function calcolaDirezioneRelativa(zonaGiocatore: string, zonaBattuta: number): string {
  const zonaLower = zonaGiocatore.toLowerCase();
  
  // Giocatore in Zona Sinistra (4, 7, 5)
  if (zonaLower.includes('sinistra')) {
    if (zonaBattuta === 1) return 'dalla sua destra';
    if (zonaBattuta === 5) return 'parallela';
    if (zonaBattuta === 6) return 'dalla sua destra (diagonale)';
  }
  
  // Giocatore in Zona Centro (3, 8, 6)
  if (zonaLower.includes('centro')) {
    if (zonaBattuta === 1) return 'dalla sua destra';
    if (zonaBattuta === 5) return 'dalla sua sinistra';
    if (zonaBattuta === 6) return 'parallela (frontale)';
  }
  
  // Giocatore in Zona Destra (2, 9, 1)
  if (zonaLower.includes('destra')) {
    if (zonaBattuta === 1) return 'dalla sua sinistra';
    if (zonaBattuta === 5) return 'dalla sua sinistra (diagonale)';
    if (zonaBattuta === 6) return 'parallela';
  }
  
  return 'direzione non specificata';
}
```

### 2. Logica di Calcolo Direzione Relativa

**Mappatura completa:**

| Zona Giocatore | Zona Battuta | Direzione Relativa |
|----------------|--------------|---------------------|
| **Sinistra** | Zona 1 | dalla sua destra |
| **Sinistra** | Zona 5 | parallela |
| **Sinistra** | Zona 6 | dalla sua destra (diagonale) |
| **Centro** | Zona 1 | dalla sua destra |
| **Centro** | Zona 5 | dalla sua sinistra |
| **Centro** | Zona 6 | parallela (frontale) |
| **Destra** | Zona 1 | dalla sua sinistra |
| **Destra** | Zona 5 | dalla sua sinistra (diagonale) |
| **Destra** | Zona 6 | parallela |

**Visualizzazione campo:**
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

### 3. Modifica Funzione `generaSintesi()`

**File:** `src/utils/analisi.ts`

**Cambiamenti principali:**

1. **Aggiunto parametro `colpiGiocatore`** per analisi dettagliata
2. **Aggiunta informazione sulla provenienza** dopo la zona critica
3. **Raccomandazione più specifica** con focus sulla zona di battuta

**Codice aggiornato:**

```typescript
// FIX SPATIALE: Punti deboli basati sulle EVIDENZE NEGATIVE con precisione spaziale
if (puntiDeboli.zonaCritica) {
  sintesi += `Criticità in Zona ${puntiDeboli.zonaCritica} del campo. `;
  
  // Aggiungi informazioni sulla provenienza della battuta e direzione relativa
  if (puntiDeboli.provenienzaCritica && puntiDeboli.zonaCritica) {
    // Estrai il numero di zona dalla stringa "Zona X"
    const zonaBattutaMatch = puntiDeboli.provenienzaCritica.match(/Zona (\d+)/);
    if (zonaBattutaMatch) {
      const zonaBattuta = parseInt(zonaBattutaMatch[1]);
      const direzioneRelativa = calcolaDirezioneRelativa(puntiDeboli.zonaCritica, zonaBattuta);
      sintesi += `La palla arriva ${direzioneRelativa} (da ${puntiDeboli.provenienzaCritica}). `;
    }
  }
}

// FIX SPATIALE: Raccomandazione con precisione spaziale assoluta
if (puntiDeboli.zonaCritica || puntiDeboli.velocitaCritica || puntiDeboli.provenienzaCritica) {
  sintesi += `RACCOMANDAZIONE: `;
  
  if (puntiDeboli.zonaCritica) {
    const latoCorretto = getLatoDaZona(puntiDeboli.zonaCritica);
    sintesi += `L'atleta deve lavorare specificamente sul lato ${latoCorretto} del corpo`;
    
    if (metriche.pe >= 15) {
      sintesi += ` per ridurre gli errori diretti (Ace subiti)`;
    } else if (metriche.pn >= 25) {
      sintesi += ` per migliorare la stabilità su ricezioni difficili`;
    }
    
    sintesi += `. `;
  }
  
  // Aggiungi dettagli specifici sulla provenienza
  if (puntiDeboli.provenienzaCritica) {
    sintesi += `Focus sulla battuta dalla ${puntiDeboli.provenienzaCritica}.`;
  } else if (puntiDeboli.velocitaCritica) {
    sintesi += `Focus sulle battute ${puntiDeboli.velocitaCritica.toLowerCase()}.`;
  }
}
```

---

## 📊 Esempio di Resoconto Migliorato

### Scenario
- **Giocatore:** Mario
- **Zona critica:** Destra
- **Provenienza critica:** Zona 5
- **Metriche:** ER 0%, PP 0%, PN 80%

### Resoconto Generato

```
Mario ha un'efficienza del 0% (Insufficiente). La percentuale positiva è del 0%. 
Ricezioni negative (giocabili ma difficili): 80.0%. 
Criticità in Zona Destra del campo. 
La palla arriva dalla sua sinistra (diagonale) (da Zona 5). 
RACCOMANDAZIONE: L'atleta deve lavorare specificamente sul lato destro del corpo 
per migliorare la stabilità su ricezioni difficili. 
Focus sulla battuta dalla Zona 5.
```

### Analisi del Testo

1. ✅ **Efficienza e metriche:** Informazioni chiare sulle performance
2. ✅ **Zona critica:** Identificata chiaramente (Zona Destra)
3. ✅ **Direzione relativa:** "dalla sua sinistra (diagonale)" - preciso e azionabile
4. ✅ **Provenienza:** "da Zona 5" - specifico
5. ✅ **Raccomandazione:** 
   - Lato del corpo: "destro"
   - Obiettivo: "migliorare la stabilità su ricezioni difficili"
   - Focus: "battuta dalla Zona 5"

---

## 🎯 Vantaggi del Miglioramento

### 1. **Precisione Spaziale**
- Il giocatore sa esattamente da dove arriva la palla problematica
- Può allenarsi simulando quella specifica direzione

### 2. **Raccomandazioni Azionabili**
- Non solo "lavora sul lato destro"
- Ma "lavora sul lato destro quando la palla arriva dalla zona 5"

### 3. **Analisi Completa**
- Combina zona di ricezione + provenienza battuta
- Fornisce contesto completo per l'allenamento

### 4. **Chiarezza Comunicativa**
- Linguaggio naturale e comprensibile
- "dalla sua sinistra (diagonale)" è più chiaro di coordinate tecniche

---

## 🧪 Test di Verifica

### Test 1: Giocatore in Zona Destra, Battuta da Zona 5

**Input:**
```typescript
zonaGiocatore = 'Destra'
zonaBattuta = 5
```

**Output atteso:**
```
"dalla sua sinistra (diagonale)"
```

**Verifica:** ✅ Corretto

---

### Test 2: Giocatore in Zona Centro, Battuta da Zona 6

**Input:**
```typescript
zonaGiocatore = 'Centro'
zonaBattuta = 6
```

**Output atteso:**
```
"parallela (frontale)"
```

**Verifica:** ✅ Corretto

---

### Test 3: Giocatore in Zona Sinistra, Battuta da Zona 1

**Input:**
```typescript
zonaGiocatore = 'Sinistra'
zonaBattuta = 1
```

**Output atteso:**
```
"dalla sua destra"
```

**Verifica:** ✅ Corretto

---

## 🔗 File Modificati

### 1. `src/utils/metriche.ts`
- ✅ Aggiunta funzione `calcolaDirezioneRelativa()`
- ✅ Documentazione completa con JSDoc
- ✅ Gestione di tutti i casi (9 combinazioni)

### 2. `src/utils/analisi.ts`
- ✅ Importata funzione `calcolaDirezioneRelativa`
- ✅ Aggiornata firma `generaSintesi()` (aggiunto parametro `colpiGiocatore`)
- ✅ Aggiunta logica per estrarre zona battuta da stringa
- ✅ Aggiunta informazione direzione relativa nella sintesi
- ✅ Migliorata raccomandazione con focus specifico

---

## ✅ Verifica Build

```
✓ 38 modules transformed
✓ dist/index.html                   0.58 kB
✓ dist/assets/index-BZjKx4lZ.js   571.08 kB │ gzip: 179.52 kB
✓ built in 2.75s
```

**Build Status:** ✅ Completato con successo

---

## 📝 Note Tecniche

### Estrazione Zona da Stringa

```typescript
const zonaBattutaMatch = puntiDeboli.provenienzaCritica.match(/Zona (\d+)/);
if (zonaBattutaMatch) {
  const zonaBattuta = parseInt(zonaBattutaMatch[1]);
  // ...
}
```

**Spiegazione:**
- `puntiDeboli.provenienzaCritica` è una stringa come "Zona 5"
- La regex `/Zona (\d+)/` estrae il numero
- `parseInt()` converte la stringa in numero

### Gestione Edge Cases

```typescript
if (zonaBattutaMatch) {
  // Solo se la regex trova un match
  const zonaBattuta = parseInt(zonaBattutaMatch[1]);
  const direzioneRelativa = calcolaDirezioneRelativa(puntiDeboli.zonaCritica, zonaBattuta);
  sintesi += `La palla arriva ${direzioneRelativa} (da ${puntiDeboli.provenienzaCritica}). `;
}
```

**Protezioni:**
- ✅ Verifica che la regex abbia trovato un match
- ✅ Gestisce casi in cui `provenienzaCritica` è null o undefined
- ✅ Fornisce fallback "direzione non specificata" se zona non riconosciuta

---

## 🚀 Prossimi Sviluppi

1. **Aggiungere velocità battuta** alla direzione relativa
   - "La palla arriva veloce dalla sua sinistra"
   
2. **Aggiungere tipologia battuta**
   - "La palla arriva da un salto float dalla sua sinistra"

3. **Statistiche per direzione relativa**
   - Tabella che mostra performance per ogni direzione relativa

4. **Grafico visuale**
   - Diagramma del campo con frecce che mostrano le direzioni critiche

---

**Build Status:** ✅ Completato con successo  
**Data Miglioramento:** 2026-01-15  
**Versione:** 2.3.0 (feature enhancement)  
**Severità:** 🟡 MEDIO (miglioramento usabilità)
