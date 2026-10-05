# Importazione Dati da File Excel - Guida Completa

## 🎯 Funzionalità Implementata

Ho aggiunto la possibilità di **importare dati da file Excel/CSV** direttamente nell'app principale tramite la sezione "Analisi Multi-Giornata". Questo permette di:

- ✅ Caricare dati registrati su un altro dispositivo
- ✅ Continuare il lavoro su un dispositivo diverso
- ✅ Unire dati da più sessioni di scouting
- ✅ Analizzare dati storici importati

## 📋 Come Funziona

### Flusso di Importazione

1. **Carica il file** nella sezione "Analisi Multi-Giornata"
2. **Clicca su "📥 Importa Dati nell'App"** (nuovo pulsante viola)
3. **Conferma l'importazione** nella finestra di dialogo
4. **I dati vengono aggiunti** alle ricezioni esistenti
5. **Continua il lavoro** con i dati importati

### Esempio Pratico

**Scenario**: Hai registrato 50 ricezioni su un tablet durante una partita e vuoi analizzarle sul computer.

1. Esporta i dati dal tablet: `ricezioni_complete_2026-01-15.xlsx`
2. Apri l'app sul computer
3. Vai alla sezione "Analisi Multi-Giornata"
4. Carica il file Excel
5. Clicca "📥 Importa Dati nell'App"
6. Conferma: "Vuoi importare 50 ricezioni da 1 file nell'app principale?"
7. ✅ I dati vengono importati e puoi analizzarli

## 🔧 Dettagli Tecnici

### Modifiche ai File

#### 1. `src/components/AnalisiMultipla.tsx`

**Aggiunta interfaccia props:**
```typescript
interface AnalisiMultiplaProps {
  onImportData?: (ricezioni: any[]) => void;
}
```

**Aggiunta funzione `importaDatiNellApp()`:**
- Legge i dati dai file caricati
- Converte i nomi delle colonne dal formato Excel al formato dell'app
- Mappa i valori (es. "Bagher" → "B", "Davanti al corpo" → "up")
- Chiama la callback `onImportData` con i dati convertiti

**Mappatura Colonne:**
```typescript
const ricezione = {
  id: Date.now() + Math.random(),
  playerIndex: parseInt(r.Giocatore?.replace('Giocatore ', '') || '0') - 1,
  playerName: r.Giocatore || 'Sconosciuto',
  zone: parseInt(r.Zona || '0'),
  side: r.Lato || 'Centro',
  serveType: r['Tipo Battuta'] || 'F',
  serveZone: parseInt(r['Zona Battuta'] || '1'),
  fundamental: r.Fondamentale === 'Bagher' ? 'B' : r.Fondamentale === 'Palleggio' ? 'P' : 'B',
  direction: r['Punto di ricezione'] === 'Davanti al corpo' ? 'up' :
             r['Punto di ricezione'] === 'A sinistra del corpo' ? 'left' :
             r['Punto di ricezione'] === 'Al corpo' ? 'center' :
             r['Punto di ricezione'] === 'A destra del corpo' ? 'right' :
             r['Punto di ricezione'] === 'Dietro al corpo' ? 'down' : 'center',
  outcome: r.Esito || '+',
  speed: r['Velocità (km/h)'] ? parseFloat(r['Velocità (km/h)']) : null,
  timestamp: r['Data e ora'] || new Date().toLocaleString('it-IT'),
};
```

#### 2. `src/components/AnalisiMultipla.css`

**Aggiunto stile per il pulsante "Importa":**
```css
.analisi-multipla-btn-importa {
  background: #8b5cf6;
  color: white;
}

.analisi-multipla-btn-importa:hover {
  background: #7c3aed;
}
```

#### 3. `src/App.tsx`

**Aggiunta funzione `handleImportData()`:**
```typescript
const handleImportData = (ricezioniImportate: any[]) => {
  // Aggiungi le nuove ricezioni a quelle esistenti
  setReceptions(prev => [...prev, ...ricezioniImportate]);
};
```

**Passata al componente:**
```tsx
<AnalisiMultipla onImportData={handleImportData} />
```

## 📊 Formato File Supportato

### Colonne Richieste nel File Excel

Il file deve contenere queste colonne (nomi esatti):

| Colonna | Esempio | Descrizione |
|---------|---------|-------------|
| `Giocatore` | "Giocatore 1" | Nome del giocatore |
| `Zona` | "5" | Zona del campo (1-9) |
| `Lato` | "Sinistra" | Lato del campo (Sinistra/Centro/Destra) |
| `Tipo Battuta` | "F" | Tipo di battuta (F/SF/SS/SP/FL) |
| `Zona Battuta` | "1" | Zona di provenienza battuta (1/5/6) |
| `Fondamentale` | "Bagher" | Fondamentale usato (Bagher/Palleggio) |
| `Punto di ricezione` | "Davanti al corpo" | Direzione della palla |
| `Esito` | "+" | Esito della ricezione (#/+!/−/=/=) |
| `Velocità (km/h)` | "85" | Velocità della battuta (opzionale) |
| `Data e ora` | "15/01/2026, 14:30:45" | Timestamp della ricezione |

### Esempio di File Excel Valido

```
Giocatore | Zona | Lato     | Tipo Battuta | Zona Battuta | Fondamentale | Punto di ricezione     | Esito | Velocità (km/h) | Data e ora
----------|------|----------|--------------|--------------|--------------|------------------------|-------|-----------------|---------------------
Giocatore 1 | 5    | Sinistra | F            | 1            | Bagher       | Davanti al corpo       | +     | 85              | 15/01/2026, 14:30:45
Giocatore 2 | 6    | Centro   | SF           | 6            | Palleggio    | Al corpo               | #     | 95              | 15/01/2026, 14:31:02
Giocatore 3 | 1    | Destra   | SS           | 5            | Bagher       | A destra del corpo     | -     | 110             | 15/01/2026, 14:31:15
```

## 🎨 Interfaccia Utente

### Nuovo Pulsante "Importa Dati"

Dopo aver caricato uno o più file, appare un nuovo pulsante viola:

```
┌─────────────────────────────────────────┐
│  📈 Calcola Analisi                      │
│  📥 Importa Dati nell'App  ← NUOVO      │
│  🗑️ Resetta Tutto                        │
└─────────────────────────────────────────┘
```

### Finestra di Conferma

Quando clicchi su "Importa Dati nell'App":

```
┌─────────────────────────────────────────┐
│  Vuoi importare 50 ricezioni da         │
│  1 file nell'app principale?            │
│                                         │
│  I dati verranno aggiunti alle          │
│  ricezioni esistenti e potrai           │
│  continuare il lavoro.                  │
│                                         │
│         [Annulla]  [OK]                 │
└─────────────────────────────────────────┘
```

### Messaggio di Successo

Dopo l'importazione:

```
┌─────────────────────────────────────────┐
│  ✅ 50 ricezioni importate con          │
│  successo!                              │
│                                         │
│  Puoi ora continuare il lavoro con      │
│  i dati caricati.                       │
│                                         │
│              [OK]                       │
└─────────────────────────────────────────┘
```

## 🔄 Casi d'Uso

### Caso 1: Trasferimento tra Dispositivi

**Scenario**: Registri dati su tablet durante la partita, poi li analizzi su PC.

1. **Su tablet**: Registra 30 ricezioni → Esporta CSV
2. **Trasferisci file**: Invia `ricezioni_complete_2026-01-15.csv` via email/cloud
3. **Su PC**: Apri app → Analisi Multi-Giornata → Carica file → Importa
4. **Risultato**: 30 ricezioni disponibili per analisi completa

### Caso 2: Unione di Più Sessioni

**Scenario**: Hai dati da 3 allenamenti diversi e vuoi analizzarli insieme.

1. Carica `ricezioni_complete_2026-01-10.xlsx`
2. Carica `ricezioni_complete_2026-01-12.xlsx`
3. Carica `ricezioni_complete_2026-01-15.xlsx`
4. Clicca "Importa Dati nell'App"
5. **Risultato**: Tutti i dati uniti per analisi completa

### Caso 3: Backup e Ripristino

**Scenario**: Vuoi fare un backup dei dati e ripristinarli in futuro.

1. Esporta dati: `ricezioni_complete_2026-01-15.xlsx`
2. Salva file in cloud/USB
3. In futuro: Apri app → Carica file → Importa
4. **Risultato**: Dati ripristinati esattamente come prima

## ⚠️ Note Importanti

### 1. Dati Aggiunti, Non Sostituiti
- I dati importati vengono **aggiunti** alle ricezioni esistenti
- Non sovrascrivono i dati attuali
- Se vuoi sostituire, usa prima "🗑️ Azzera dati"

### 2. ID Unici
- Ogni ricezione importata riceve un nuovo ID univoco
- Evita conflitti con ricezioni esistenti
- Timestamp preservato dal file originale

### 3. Compatibilità
- Funziona con file esportati dall'app (CSV e Excel)
- Mappatura automatica delle colonne
- Gestisce valori mancanti con default

### 4. Persistenza
- I dati importati vengono salvati in localStorage
- Sopravvivono al refresh della pagina
- Disponibili anche dopo chiusura del browser

## 🐛 Risoluzione Problemi

### Problema: "Funzione di importazione non disponibile"

**Causa**: Il componente non ha ricevuto la callback `onImportData`

**Soluzione**: Verifica che in `App.tsx` ci sia:
```tsx
<AnalisiMultipla onImportData={handleImportData} />
```

### Problema: "Nessun file caricato da importare"

**Causa**: Non hai caricato nessun file prima di cliccare "Importa"

**Soluzione**: Carica almeno un file Excel/CSV prima di importare

### Problema: Dati importati ma non visibili

**Causa**: I dati sono stati importati ma non aggiornati nella UI

**Soluzione**: Ricarica la pagina (F5) per vedere i dati importati

### Problema: Colonne non riconosciute

**Causa**: Il file Excel ha nomi di colonne diversi da quelli attesi

**Soluzione**: Verifica che le colonne abbiano i nomi esatti:
- `Giocatore`, `Zona`, `Lato`, `Tipo Battuta`, `Zona Battuta`, `Fondamentale`, `Punto di ricezione`, `Esito`, `Velocità (km/h)`, `Data e ora`

## 📈 Statistiche Importazione

Dopo l'importazione, puoi vedere:

1. **Storico Ricezioni**: Mostra tutte le ricezioni (vecchie + nuove)
2. **Statistiche per Esito**: Include dati importati
3. **Punto di Ricezione per Lato**: Include dati importati
4. **Resoconto Analisi**: Analizza tutti i dati (vecchi + nuovi)
5. **Analisi Multi-Giornata**: Confronta evoluzione temporale

## 🚀 Prossimi Sviluppi

1. **Importazione Selettiva**: Scegliere quali file importare
2. **Anteprima Dati**: Vedere i dati prima di importarli
3. **Merge Intelligente**: Evitare duplicati durante l'importazione
4. **Export Completo**: Esportare tutti i dati (vecchi + nuovi) in un unico file
5. **Sincronizzazione Cloud**: Sincronizzare dati tra dispositivi automaticamente

## ✅ Build Status

```
✓ 47 modules transformed
✓ dist/assets/index-dOM4_QOa.js: 587.06 kB (gzip: 183.60 kB)
✓ dist/assets/index-CmeCT_OB.css: 24.11 kB (gzip: 4.72 kB)
✓ built in 4.56s
```

**Build completato con successo** ✅

## 📝 Riepilogo

La funzionalità di importazione dati permette di:
- ✅ Caricare file Excel/CSV da altri dispositivi
- ✅ Importare dati nell'app principale con un click
- ✅ Continuare il lavoro su dispositivi diversi
- ✅ Unire dati da più sessioni
- ✅ Fare backup e ripristino dei dati

L'implementazione è minimale (solo 3 file modificati) e non altera la logica esistente dell'app, rispettando la regola fondamentale del progetto.
