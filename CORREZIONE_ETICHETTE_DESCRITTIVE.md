# Correzione Etichette Descrittive nel Resoconto

## Problema Identificato

Le etichette nel resoconto non erano sufficientemente descrittive e contenevano errori grammaticali:

### Errori Trovati

1. **Articolo errato**: "verso il destra" invece di "verso la destra"
2. **Etichette poco chiare**:
   - "Direzione critica: right" → mancava la spiegazione
   - "Provenienza critica: 5" → mancava "da zona"
   - "Esito negativo prevalente: Negativa (-)" → mancava la direzione del colpo

### Esempio Prima della Correzione

```
Criticità (Evidenze Negative)

Caratteristiche negatività: dalla zona 5 verso il destra
Esito negativo prevalente: Negativa (-)
⚠️ Zona Destra: lavorare sul lato destro
Direzione critica: right
Provenienza critica: 5
```

## Soluzione Implementata

### 1. Correzione Articolo Grammaticale

**File**: `src/utils/analisi.ts`

**Funzioni modificate**:
- `analizzaCaratteristicheNegativita()` (riga 524)
- `analizzaCaratteristichePositivita()` (riga 474)

**Modifica**:
```typescript
// Prima
caratteristiche.push(`verso il ${zonaPiuFrequente[0].toLowerCase()}`);

// Dopo
const articolo = zonaPiuFrequente[0].toLowerCase() === 'centro' ? 'il' : 'la';
caratteristiche.push(`verso ${articolo} ${zonaPiuFrequente[0].toLowerCase()}`);
```

**Risultato**:
- "verso il centro" (maschile)
- "verso la sinistra" (femminile)
- "verso la destra" (femminile)

### 2. Funzioni Helper per Etichette Descrittive

**File**: `src/components/ResocontoAnalisi.tsx` e `src/utils/analisi.ts`

**Funzioni aggiunte**:

#### `getDirezioneLabel(direzione: string): string`
Converte le chiavi delle direzioni in etichette descrittive:

```typescript
const direzioni: Record<string, string> = {
  'up': 'avanti',
  'down': 'dietro',
  'left': 'lato sinistro',
  'right': 'lato destro',
  'center': 'al corpo',
  'Davanti al corpo': 'avanti',
  'A sinistra del corpo': 'lato sinistro',
  'Al corpo': 'al corpo',
  'A destra del corpo': 'lato destro',
  'Dietro al corpo': 'dietro',
};
```

#### `getProvenienzaLabel(provenienza: string): string`
Formatta le provenienze in modo descrittivo:

```typescript
function getProvenienzaLabel(provenienza: string): string {
  if (provenienza.startsWith('Zona ')) {
    return `da ${provenienza.toLowerCase()}`;
  }
  if (provenienza.match(/^\d+$/)) {
    return `da zona ${provenienza}`;
  }
  return provenienza;
}
```

### 3. Aggiornamento UI del Resoconto

**File**: `src/components/ResocontoAnalisi.tsx`

**Modifiche**:

#### Esito Negativo Prevalente (riga 221-226)
```typescript
// Prima
Esito negativo prevalente: <strong>{analisi.puntiDeboli.esitoNegativoPrevalente}</strong>

// Dopo
Esito negativo prevalente: <strong>{analisi.puntiDeboli.esitoNegativoPrevalente}</strong>
{analisi.puntiDeboli.direzioneCritica && (
  <span> - direzione: {getDirezioneLabel(analisi.puntiDeboli.direzioneCritica)}</span>
)}
```

#### Direzione Critica (riga 269-271)
```typescript
// Prima
Direzione critica: {analisi.puntiDeboli.direzioneCritica}

// Dopo
Direzione critica: <strong>{analisi.puntiDeboli.direzioneCritica}</strong> ({getDirezioneLabel(analisi.puntiDeboli.direzioneCritica)})
```

#### Provenienza Critica (riga 272-274)
```typescript
// Prima
Provenienza critica: {analisi.puntiDeboli.provenienzaCritica}

// Dopo
Provenienza critica: <strong>{getProvenienzaLabel(analisi.puntiDeboli.provenienzaCritica)}</strong>
```

### 4. Aggiornamento Sintesi Testuale

**File**: `src/utils/analisi.ts`

**Modifica** (riga 682):
```typescript
// Prima
sintesi += `Focus sulla battuta dalla zona ${puntiDeboli.provenienzaCritica}.`;

// Dopo
sintesi += `Focus sulla battuta ${getProvenienzaLabel(puntiDeboli.provenienzaCritica)}.`;
```

## Risultato Finale

### Esempio Dopo la Correzione

```
Criticità (Evidenze Negative)

Caratteristiche negatività: dalla zona 5 verso la destra
Esito negativo prevalente: Negativa (-) - direzione: lato destro
⚠️ Zona Destra: lavorare sul lato destro
Direzione critica: right (lato destro)
Provenienza critica: da zona 5
```

### Confronto Prima/Dopo

| Campo | Prima | Dopo |
|-------|-------|------|
| Caratteristiche | "verso il destra" | "verso la destra" |
| Esito negativo | "Negativa (-)" | "Negativa (-) - direzione: lato destro" |
| Direzione critica | "right" | "right (lato destro)" |
| Provenienza critica | "5" | "da zona 5" |

## Vantaggi

1. **Chiarezza**: Le etichette sono ora auto-esplicative
2. **Completezza**: Ogni criticità include tutte le informazioni rilevanti
3. **Correttezza grammaticale**: Articoli corretti per ogni zona
4. **Coerenza**: Stesse etichette usate in UI, sintesi testuale ed export

## File Modificati

1. **src/utils/analisi.ts**
   - Correzione articolo in `analizzaCaratteristicheNegativita()`
   - Correzione articolo in `analizzaCaratteristichePositivita()`
   - Aggiunte funzioni helper `getDirezioneLabel()` e `getProvenienzaLabel()`
   - Aggiornata funzione `generaSintesi()`

2. **src/components/ResocontoAnalisi.tsx**
   - Aggiunte funzioni helper `getDirezioneLabel()` e `getProvenienzaLabel()`
   - Aggiornata visualizzazione esito negativo prevalente
   - Aggiornata visualizzazione direzione critica
   - Aggiornata visualizzazione provenienza critica

## Build Status

✅ Build completato con successo (572.05 kB gzipped: 179.81 kB)

## Note Tecniche

### Perché Due Implementazioni delle Funzioni Helper?

Le funzioni `getDirezioneLabel()` e `getProvenienzaLabel()` sono implementate sia in:
- `src/components/ResocontoAnalisi.tsx` (per l'UI)
- `src/utils/analisi.ts` (per la sintesi testuale e l'export)

Questo perché:
1. **Indipendenza dei moduli**: Il componente UI non deve dipendere da funzioni interne di analisi
2. **Performance**: Evita import circolari o dipendenze non necessarie
3. **Manutenibilità**: Ogni modulo è autonomo e può essere testato separatamente

### Gestione Edge Cases

Le funzioni helper gestiscono diversi formati di input:

```typescript
// getProvenienzaLabel
"Zona 5" → "da zona 5"
"5" → "da zona 5"
"altro" → "altro"

// getDirezioneLabel
"right" → "lato destro"
"A destra del corpo" → "lato destro"
"sconosciuto" → "sconosciuto"
```

Questo garantisce robustezza anche con dati inattesi o vecchi formati.
