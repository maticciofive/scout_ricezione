# Guida Integrazione Soglie Globali

## Panoramica

Questo documento mostra come aggiornare i componenti esistenti per utilizzare le soglie globali configurabili tramite React Context.

## File Creati

### 1. `src/utils/configSoglie.ts`
Definisce l'interfaccia `SoglieConfig` e le funzioni per gestire il localStorage.

### 2. `src/context/SoglieContext.tsx`
Fornisce il Context Provider e l'hook `useSoglie()` per accedere alle soglie da qualsiasi componente.

### 3. `src/utils/valutaColori.ts`
Contiene le funzioni pure `getStatoColore()`, `getColoreCSS()` e `getColoreTesto()` per determinare i colori in base alle soglie.

### 4. `src/components/ConfigSoglieUI.tsx`
Componente UI per configurare le soglie con validazione e anteprima in tempo reale.

### 5. Integrazione in `App.tsx`
- Import di `SoglieProvider` e `ConfigSoglieUI`
- Avvolgimento dell'app con `<SoglieProvider>`
- Aggiunta del componente `<ConfigSoglieUI />` nell'interfaccia

## Come Aggiornare i Componenti Esistenti

### Esempio 1: ResocontoAnalisi.tsx

#### Import necessari (aggiungere in cima al file)
```typescript
// MODIFICATO PER SOGLIE GLOBALI
import { useSoglie } from '../context/SoglieContext';
import { getStatoColore, getColoreCSS, getColoreTesto } from '../utils/valutaColori';
```

#### Nel componente (dopo la dichiarazione degli stati)
```typescript
// MODIFICATO PER SOGLIE GLOBALI
const { soglie } = useSoglie();
```

#### Sostituire le funzioni di valutazione hardcoded
**PRIMA:**
```typescript
const getHighlightBg = (n: number, t: number): string => {
  if (highlightMode === 'none' || t === 0) return 'transparent';
  const percentage = (n / t) * 100;
  
  if (highlightMode === 'green' && percentage >= 70) return '#d1fae5';
  if (highlightMode === 'orange' && percentage >= 40 && percentage < 70) return '#fed7aa';
  if (highlightMode === 'red' && percentage < 40) return '#fecaca';
  
  return 'transparent';
};
```

**DOPO:**
```typescript
// MODIFICATO PER SOGLIE GLOBALI
const getHighlightBg = (n: number, t: number, tipo: 'positivo' | 'negativo' | 'errore' = 'positivo'): string => {
  if (highlightMode === 'none' || t === 0) return 'transparent';
  const percentage = (n / t) * 100;
  const stato = getStatoColore(tipo, percentage, soglie);
  return getColoreCSS(stato);
};
```

#### Aggiornare le chiamate nelle tabelle
**PRIMA:**
```typescript
<td style={{ ...tdStyle, textAlign: 'center', background: getHighlightBg(counts[o.key], total) }}>
```

**DOPO:**
```typescript
{/* MODIFICATO PER SOGLIE GLOBALI */}
<td style={{ 
  ...tdStyle, 
  textAlign: 'center', 
  background: getHighlightBg(
    counts[o.key], 
    total, 
    o.key === '#' || o.key === '+' ? 'positivo' : 
    o.key === '-' || o.key === '/' || o.key === '!' ? 'negativo' : 'errore'
  ) 
}}>
```

---

### Esempio 2: TabellaAnalisiIncrociata.tsx

#### Import necessari
```typescript
// MODIFICATO PER SOGLIE GLOBALI
import { useSoglie } from '../context/SoglieContext';
import { getStatoColore, getColoreCSS } from '../utils/valutaColori';
```

#### Nel componente
```typescript
// MODIFICATO PER SOGLIE GLOBALI
const { soglie } = useSoglie();
```

#### Aggiornare la logica di evidenziazione
**PRIMA:**
```typescript
<td className={stat.esiti.errore >= 15 ? 'cella-errore-critico' : stat.esiti.errore > 0 ? 'cella-errore' : ''}>
  {formatPercentuale(stat.esiti.errore)}
</td>
```

**DOPO:**
```typescript
{/* MODIFICATO PER SOGLIE GLOBALI */}
{(() => {
  const statoErrore = getStatoColore('errore', stat.esiti.errore, soglie);
  const className = statoErrore === 'rosso' ? 'cella-errore-critico' : 
                    statoErrore !== 'neutro' ? 'cella-errore' : '';
  return (
    <td className={className}>
      {formatPercentuale(stat.esiti.errore)}
    </td>
  );
})()}
```

#### Aggiornare l'evidenziazione delle righe positive
**PRIMA:**
```typescript
const sommaPositiva = stat.esiti.perfetta + stat.esiti.positiva;
const classeRiga = sommaPositiva >= 60 ? 'riga-positiva' : '';
```

**DOPO:**
```typescript
// MODIFICATO PER SOGLIE GLOBALI
const sommaPositiva = stat.esiti.perfetta + stat.esiti.positiva;
const statoPositivo = getStatoColore('positivo', sommaPositiva, soglie);
const classeRiga = statoPositivo === 'verde' ? 'riga-positiva' : '';
```

---

### Esempio 3: AnalisiMultipla.tsx

#### Import necessari
```typescript
// MODIFICATO PER SOGLIE GLOBALI
import { useSoglie } from '../context/SoglieContext';
import { getStatoColore } from '../utils/valutaColori';
```

#### Nel componente
```typescript
// MODIFICATO PER SOGLIE GLOBALI
const { soglie } = useSoglie();
```

#### Aggiornare la classificazione dei valori
**PRIMA:**
```typescript
<td className={giorno.pp >= 55 ? 'valore-positivo' : giorno.pp >= 45 ? 'valore-medio' : 'valore-negativo'}>
  {giorno.pp.toFixed(1)}%
</td>
```

**DOPO:**
```typescript
{/* MODIFICATO PER SOGLIE GLOBALI */}
{(() => {
  const stato = getStatoColore('positivo', giorno.pp, soglie);
  const className = stato === 'verde' ? 'valore-positivo' : 
                    stato === 'arancione' ? 'valore-medio' : 'valore-negativo';
  return (
    <td className={className}>
      {giorno.pp.toFixed(1)}%
    </td>
  );
})()}
```

---

## Vantaggi dell'Approccio Context

1. **Reattività**: Cambiando una soglia in `ConfigSoglieUI`, tutti i componenti si aggiornano istantaneamente
2. **Persistenza**: Le soglie vengono salvate nel localStorage e persistono tra le sessioni
3. **Sincronizzazione**: Se l'app è aperta in più tab, le soglie si sincronizzano automaticamente
4. **Manutenibilità**: La logica delle soglie è centralizzata, non duplicata in ogni componente
5. **Testabilità**: Le funzioni pure in `valutaColori.ts` sono facilmente testabili

## Flusso di Aggiornamento

```
Utente modifica soglia in ConfigSoglieUI
    ↓
aggiornaSoglie() aggiorna il Context
    ↓
Context notifica tutti i componenti subscribed
    ↓
Ogni componente chiama useSoglie() e riceve le nuove soglie
    ↓
getStatoColore() ricalcola i colori con le nuove soglie
    ↓
UI si aggiorna istantaneamente
```

## Note Importanti

1. **Non modificare la logica esistente**: I componenti continuano a funzionare come prima, solo i colori cambiano in base alle soglie globali
2. **Compatibilità all'indietro**: Se un componente non viene aggiornato, continua a usare le soglie hardcoded
3. **Performance**: React Context è ottimizzato per questo tipo di uso e non causa re-render non necessari
4. **TypeScript**: Tutti i file sono completamente tipizzati per garantire type safety

## Testing

Per verificare che l'integrazione funzioni correttamente:

1. Apri l'app e modifica una soglia in "Configurazione Soglie Globali"
2. Verifica che tutte le tabelle e i resoconti si aggiornino istantaneamente
3. Ricarica la pagina e verifica che le soglie personalizzate siano ancora presenti
4. Apri l'app in due tab diverse, modifica le soglie in una e verifica che si aggiornino anche nell'altra
