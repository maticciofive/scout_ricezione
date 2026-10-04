# Implementazione Soglie Globali Configurabili

## Panoramica

È stato implementato un sistema completo di soglie configurabili globali che si applicano a tutte le analisi e tabelle dell'applicazione. Le soglie sono reattive, persistenti e sincronizzate tra tutte le tab del browser.

## Architettura

### 1. Context API (`src/context/SoglieContext.tsx`)
- **SoglieProvider**: Wrappa l'intera applicazione per rendere le soglie disponibili globalmente
- **useSoglie()**: Hook personalizzato per accedere alle soglie da qualsiasi componente
- **Persistenza**: Le soglie vengono salvate in localStorage
- **Sincronizzazione**: Eventi `storage` sincronizzano le soglie tra tab del browser

### 2. Configurazione (`src/utils/configSoglie.ts`)
- **SoglieConfig**: Interfaccia TypeScript per la configurazione delle soglie
- **SOGLIE_DEFAULT**: Valori predefiniti (Positivi: 60%/45%, Negativi: 10%/25%, Errori: 5%/15%)
- **Funzioni di storage**: `caricaSoglie()`, `salvaSoglie()`, `resetSoglie()`

### 3. Valutazione Colori (`src/utils/valutaColori.ts`)
- **getStatoColore()**: Determina il colore (verde/arancione/rosso) in base al tipo di esito e percentuale
- **getColoreCSS()**: Restituisce il colore CSS corrispondente allo stato
- **getColoreTesto()**: Restituisce il colore del testo per garantire leggibilità
- **Logica**:
  - **Positivi**: Più alto è meglio (verde ≥ X%, arancione ≥ Y%, rosso < Y%)
  - **Negativi**: Più basso è meglio (verde ≤ X%, arancione ≤ Y%, rosso > Y%)
  - **Errori**: Più basso è meglio (verde ≤ X%, arancione ≤ Y%, rosso > Y%)

### 4. UI Configurazione (`src/components/ConfigSoglieUI.tsx`)
- **Accordion**: Pannello espandibile/collassabile per non occupare spazio quando non serve
- **Toggle attivazione**: Checkbox per attivare/disattivare l'evidenziazione
- **3 sezioni**: Positivi, Negativi, Errori con input numerici
- **Validazione**: Controlla che le soglie siano coerenti (es. verde > arancione per positivi)
- **Anteprima**: Mostra visivamente le soglie configurate
- **Pulsanti**: Salva configurazione e Reset ai valori di default

## Modifiche a App.tsx

### Importaggi aggiunti
```typescript
import { SoglieProvider, useSoglie } from './context/SoglieContext';
import ConfigSoglieUI from './components/ConfigSoglieUI';
import { getStatoColore, getColoreCSS } from './utils/valutaColori';
```

### Rimozioni
- **Stati locali rimossi**: `highlightMode`, `greenThreshold`, `orangeThreshold`
- **useEffect rimossi**: Salvataggio soglie locali in localStorage
- **UI rimossa**: Vecchia sezione "Evidenzia percentuali" sotto Comandi

### Aggiunte
- **SoglieProvider**: Wrappa l'intera applicazione
- **ConfigSoglieUI**: Pannello accordion dopo la sezione Comandi
- **useSoglie()**: Hook per accedere alle soglie globali
- **getTipoEsito()**: Helper per determinare il tipo di esito dalla chiave
- **getHighlightBg()**: Aggiornato per usare le soglie globali

### Funzione getHighlightBg aggiornata
```typescript
const getHighlightBg = (n: number, t: number, tipo: 'positivo' | 'negativo' | 'errore' = 'positivo'): string => {
  if (t === 0) return 'transparent';
  const percentage = (n / t) * 100;
  const stato = getStatoColore(tipo, percentage, soglie);
  return getColoreCSS(stato);
};
```

### Funzione getTipoEsito aggiunta
```typescript
const getTipoEsito = (esito: string): 'positivo' | 'negativo' | 'errore' => {
  if (esito === '#' || esito === '+') return 'positivo';
  if (esito === '!' || esito === '-' || esito === '/') return 'negativo';
  if (esito === '=') return 'errore';
  return 'positivo'; // default
};
```

## Come Funziona

### Flusso di aggiornamento
1. Utente modifica una soglia in ConfigSoglieUI
2. `aggiornaSoglie()` aggiorna il Context e salva in localStorage
3. Il Context notifica tutti i componenti subscribed
4. Ogni componente chiama `useSoglie()` e riceve le nuove soglie
5. `getStatoColore()` ricalcola i colori con le nuove soglie
6. UI si aggiorna istantaneamente

### Persistenza
- Le soglie vengono salvate in localStorage con chiave `soglie_config_globali`
- Al caricamento dell'app, le soglie vengono caricate da localStorage
- Se non ci sono soglie salvate, vengono usati i valori di default

### Sincronizzazione tra tab
- Quando una tab modifica le soglie, viene triggerato un evento `storage`
- Le altre tab ascoltano questo evento e aggiornano le loro soglie
- Questo garantisce coerenza tra tutte le tab aperte

## Utilizzo

### Per l'utente
1. Clicca su "▼ Mostra" per espandere il pannello delle soglie
2. Modifica i valori nelle sezioni Positivi, Negativi, Errori
3. Clicca "💾 Salva Configurazione" per applicare le modifiche
4. Tutte le tabelle e analisi si aggiornano istantaneamente
5. Clicca "▲ Nascondi" per collassare il pannello
6. Usa il toggle "Attiva evidenziazione" per mostrare/nascondere i colori

### Per lo sviluppatore
Per aggiungere le soglie globali a un nuovo componente:

```typescript
import { useSoglie } from '../context/SoglieContext';
import { getStatoColore, getColoreCSS } from '../utils/valutaColori';

function MioComponente() {
  const { soglie } = useSoglie();
  
  // Usa getStatoColore per determinare il colore
  const stato = getStatoColore('positivo', percentuale, soglie);
  const colore = getColoreCSS(stato);
  
  return <div style={{ background: colore }}>...</div>;
}
```

## Vantaggi

1. **Centralizzazione**: Le soglie sono definite in un unico posto
2. **Reattività**: Cambiamenti istantanei in tutta l'app
3. **Persistenza**: Le configurazioni vengono salvate automaticamente
4. **Sincronizzazione**: Coerenza tra tutte le tab del browser
5. **Type Safety**: TypeScript garantisce correttezza dei tipi
6. **Manutenibilità**: Facile aggiungere nuove soglie o modificare la logica
7. **UX**: Pannello accordion non occupa spazio quando non serve

## File Creati/Modificati

### Creati
- `src/utils/configSoglie.ts`
- `src/context/SoglieContext.tsx`
- `src/utils/valutaColori.ts`
- `src/components/ConfigSoglieUI.tsx`
- `src/components/ConfigSoglieUI.css`
- `GUIDA_INTEGRAZIONE_SOGLIE_GLOBALI.md`

### Modificati
- `src/App.tsx`:
  - Aggiunti import per Context e UI
  - Rimosso vecchia sezione "Evidenzia percentuali"
  - Aggiunto SoglieProvider
  - Aggiunto ConfigSoglieUI
  - Aggiornato getHighlightBg per usare soglie globali
  - Aggiunto getTipoEsito helper

## Build Status

✅ Build completato con successo
- 43 modules transformed
- dist/assets/index-BrDXWhRk.js: 577.21 kB (gzip: 181.06 kB)
- dist/assets/index-CCl1Toex.css: 18.12 kB (gzip: 3.67 kB)

## Note Tecniche

### Perché Context API invece di props drilling?
- Evita di passare le soglie attraverso molti livelli di componenti
- Rende le soglie accessibili da qualsiasi componente senza modifiche
- Migliore performance: solo i componenti che usano le soglie si aggiornano

### Perché localStorage invece di un backend?
- L'app è client-side, non ha backend
- localStorage è sufficiente per persistenza locale
- Più semplice e veloce di una soluzione server-side

### Perché un accordion?
- Non occupa spazio quando non serve
- L'utente può scegliere quando configurare le soglie
- Migliore UX rispetto a un pannello sempre visibile

## Prossimi Passi

Per completare l'integrazione delle soglie globali in tutti i componenti:

1. **ResocontoAnalisi.tsx**: Aggiornare per usare `useSoglie()` e `getStatoColore()`
2. **TabellaAnalisiIncrociata.tsx**: Aggiornare evidenziazione celle
3. **AnalisiMultipla.tsx**: Aggiornare classificazione valori giornalieri

Vedi `GUIDA_INTEGRAZIONE_SOGLIE_GLOBALI.md` per esempi dettagliati.
