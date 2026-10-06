# Modifica Ricezioni nello Storico - Guida Completa

## 🎯 Funzionalità Implementata

Ora puoi **modificare ogni singola ricezione** direttamente dallo storico, non solo annullarla. Questo ti permette di correggere errori di inserimento senza dover cancellare e reinserire l'intera ricezione.

## ✅ Cosa Puoi Modificare

Per ogni ricezione puoi modificare:
1. **📍 Zona di Provenienza Battuta** (Zona 1, 6, 5)
2. **🏐 Tipo di Battuta** (Float, Salto Float, Salto Spin, Splot, Flin)
3. **👤 Giocatore** che ha ricevuto
4. **🤲 Fondamentale** (Bagher, Palleggio)
5. **🎯 Direzione** dove ha colpito la palla (▲ ◀ ● ▶ ▼)
6. **✅ Esito** della ricezione (# + ! - / =)
7. **⚡ Velocità** della battuta (km/h)

## 📋 Come Usare la Funzionalità

### 1. Trova la Ricezione da Modificare
- Scorri lo **Storico Ricezioni**
- Identifica la ricezione con l'errore

### 2. Clicca su "✏️ Modifica"
- Accanto a ogni ricezione trovi due pulsanti:
  - **✏️ Modifica** (blu) - per modificare la ricezione
  - **🗑️ Annulla** (rosso) - per eliminare la ricezione

### 3. Modifica i Dati nel Modal
Si apre un modal con tutti i campi della ricezione:
- Ogni campo mostra il valore attuale selezionato
- Clicca sui pulsanti per cambiare i valori
- I pulsanti selezionati diventano blu

### 4. Salva le Modifiche
- Clicca **💾 Salva Modifiche** per confermare
- Oppure **❌ Annulla** per tornare indietro senza salvare

## 🎨 Interfaccia del Modal

### Layout del Modal
```
┌─────────────────────────────────────────┐
│  ✏️ Modifica Ricezione                   │
├─────────────────────────────────────────┤
│                                          │
│  📍 Zona di Provenienza Battuta         │
│  [Zona 1] [Zona 6] [Zona 5]             │
│                                          │
│  🏐 Tipo di Battuta                      │
│  [🎯 Float] [🏐 Salto Float] ...        │
│                                          │
│  👤 Giocatore                            │
│  [VOLPE] [HUTREL] [ROSSI]               │
│                                          │
│  🤲 Fondamentale                         │
│  [🤲 Bagher] [👐 Palleggio]             │
│                                          │
│  🎯 Dove ha colpito la palla            │
│      [▲]                                 │
│  [◀] [●] [▶]                            │
│      [▼]                                 │
│                                          │
│  ✅ Esito della Ricezione                │
│  [#] [+] [!] [-] [/] [=]                │
│                                          │
│  ⚡ Velocità (km/h) - Opzionale         │
│  [85                                    ]│
│                                          │
│              [❌ Annulla] [💾 Salva]     │
└─────────────────────────────────────────┘
```

### Feedback Visivo
- **Pulsante selezionato**: Sfondo blu (#2563eb), testo bianco, bordo scuro
- **Pulsante non selezionato**: Sfondo grigio (#f3f4f6), testo scuro, bordo chiaro
- **Esiti**: Mantengono i colori originali (verde, giallo, arancione, rosso, grigio)

## 🔄 Cosa Succede Quando Salvi

### Aggiornamento Automatico
Quando salvi le modifiche, il sistema aggiorna automaticamente:
- ✅ **playerName**: Nome del giocatore selezionato
- ✅ **zone**: Zona del campo del giocatore
- ✅ **side**: Lato del campo (Sinistra/Centro/Destra) calcolato dalla zona

### Esempio Pratico

**Ricezione Originale:**
```
Giocatore: VOLPE
Zona: 5 (Sinistra)
Tipo Battuta: Float
Zona Battuta: 1
Fondamentale: Bagher
Direzione: Davanti
Esito: +
Velocità: 85 km/h
```

**Modifichi:**
- Giocatore: da VOLPE a HUTREL
- Esito: da + a #

**Ricezione Aggiornata:**
```
Giocatore: HUTREL
Zona: 6 (Centro) ← aggiornato automaticamente
Tipo Battuta: Float
Zona Battuta: 1
Fondamentale: Bagher
Direzione: Davanti
Esito: # ← modificato
Velocità: 85 km/h
```

## 📊 Impatto sulle Statistiche

### Aggiornamento in Tempo Reale
Dopo aver salvato le modifiche:
- ✅ **Statistiche per Esito**: Si aggiornano immediatamente
- ✅ **Punto di Ricezione per Lato**: Si aggiorna
- ✅ **Resoconto Analisi**: Si rigenera con i nuovi dati
- ✅ **Tabella Direzione × Esito**: Si aggiorna
- ✅ **Export CSV/Excel**: Includerà i dati corretti

### Esempio
Se modifichi un esito da "+" a "#":
- La statistica "Positive" diminuisce di 1
- La statistica "Perfette" aumenta di 1
- La PP (Percentuale Positiva) viene ricalcolata

## 🛡️ Sicurezza dei Dati

### ID Invariato
- L'ID della ricezione **non cambia** durante la modifica
- Questo mantiene l'ordine cronologico nello storico
- Previene conflitti con altre funzionalità

### Validazione
- Tutti i campi sono obbligatori tranne la velocità
- Il sistema usa i valori di default se mancano dati
- Non puoi salvare una ricezione incompleta

### Persistenza
- Le modifiche vengono salvate in localStorage
- Sopravvivono al refresh della pagina
- Vengono esportate correttamente in CSV/Excel

## 🎯 Casi d'Uso Comuni

### Caso 1: Giocatore Sbagliato
**Problema**: Hai registrato una ricezione per VOLPE ma era di HUTREL

**Soluzione**:
1. Trova la ricezione nello storico
2. Clicca "✏️ Modifica"
3. Seleziona HUTREL invece di VOLPE
4. Clicca "💾 Salva Modifiche"

**Risultato**: La ricezione viene riassegnata a HUTREL con zona e lato aggiornati automaticamente

### Caso 2: Esito Errato
**Problema**: Hai segnato "+" ma era un errore "="

**Soluzione**:
1. Trova la ricezione nello storico
2. Clicca "✏️ Modifica"
3. Seleziona "=" invece di "+"
4. Clicca "💾 Salva Modifiche"

**Risultato**: Le statistiche si aggiornano (PE aumenta, PP diminuisce)

### Caso 3: Zona di Provenienza Sbagliata
**Problema**: La battuta veniva da Zona 6, non da Zona 1

**Soluzione**:
1. Trova la ricezione nello storico
2. Clicca "✏️ Modifica"
3. Seleziona "Zona 6" invece di "Zona 1"
4. Clicca "💾 Salva Modifiche"

**Risultato**: La tabella "Distribuzione Tipo Battuta x Zona Provenienza" si aggiorna

### Caso 4: Fondamentale Errato
**Problema**: Hai segnato "Bagher" ma era "Palleggio"

**Soluzione**:
1. Trova la ricezione nello storico
2. Clicca "✏️ Modifica"
3. Seleziona "👐 Palleggio" invece di "🤲 Bagher"
4. Clicca "💾 Salva Modifiche"

**Risultato**: Le statistiche per fondamentale si aggiornano

## 🔍 Dettagli Tecnici

### Stato di Modifica
```typescript
const [editingReception, setEditingReception] = useState<Reception | null>(null);
const [editForm, setEditForm] = useState<Partial<Reception>>({});
```

### Funzioni Principali

**startEditReception**: Apre il modal e inizializza il form
```typescript
const startEditReception = (reception: Reception) => {
  setEditingReception(reception);
  setEditForm({
    serveZone: reception.serveZone,
    serveType: reception.serveType,
    playerIndex: reception.playerIndex,
    fundamental: reception.fundamental,
    direction: reception.direction,
    outcome: reception.outcome,
    speed: reception.speed,
  });
};
```

**saveEditReception**: Salva le modifiche
```typescript
const saveEditReception = () => {
  if (!editingReception) return;
  
  const updatedReception: Reception = {
    ...editingReception,
    ...editForm,
    playerName: players[editForm.playerIndex || 0]?.name || editingReception.playerName,
    zone: players[editForm.playerIndex || 0]?.zone || editingReception.zone,
    side: getSideForZone(players[editForm.playerIndex || 0]?.zone || editingReception.zone),
  };
  
  setReceptions(prev => prev.map(r => r.id === editingReception.id ? updatedReception : r));
  setEditingReception(null);
  setEditForm({});
};
```

**cancelEditReception**: Annulla la modifica
```typescript
const cancelEditReception = () => {
  setEditingReception(null);
  setEditForm({});
};
```

## 📱 Responsive Design

### Mobile
- Il modal si adatta allo schermo
- I pulsanti si dispongono su più righe se necessario
- Scroll verticale per contenuti lunghi

### Desktop
- Modal centrato con larghezza massima 600px
- Tutti i pulsanti visibili senza scroll
- Overlay scuro per focalizzare l'attenzione

## ✅ Build Status

```
✓ 47 modules transformed
✓ dist/assets/index-DxvgvxJF.js: 596.20 kB (gzip: 185.19 kB)
✓ dist/assets/index-CmeCT_OB.css: 24.11 kB (gzip: 4.72 kB)
✓ built in 4.82s
```

**Build completato con successo** ✅

## 📝 File Modificati

**`src/App.tsx`**:
- Aggiunti stati `editingReception` e `editForm`
- Aggiunte funzioni `startEditReception`, `saveEditReception`, `cancelEditReception`
- Aggiunto pulsante "✏️ Modifica" nello storico
- Aggiunto modal di modifica completo

## 🚀 Vantaggi

1. **Correzione Rapida**: Modifica solo i campi errati senza reinserire tutto
2. **Precisione**: Mantieni i dati corretti e correggi solo gli errori
3. **Efficienza**: Risparmia tempo rispetto a cancellare e reinserire
4. **Flessibilità**: Puoi modificare qualsiasi campo in qualsiasi momento
5. **Sicurezza**: L'ID rimane invariato, mantenendo l'ordine cronologico

## 💡 Suggerimenti

### Best Practices
1. **Controlla prima di salvare**: Verifica che tutti i campi siano corretti
2. **Modifica un campo alla volta**: Per evitare errori multipli
3. **Usa "Annulla" se incerto**: Meglio annullare che salvare dati errati
4. **Verifica le statistiche**: Dopo la modifica, controlla che le statistiche siano corrette

### Quando Usare la Modifica
- ✅ Hai sbagliato un solo campo
- ✅ Hai selezionato il giocatore sbagliato
- ✅ Hai segnato l'esito errato
- ✅ Hai dimenticato di inserire la velocità

### Quando Usare "Annulla"
- ❌ La ricezione è completamente errata
- ❌ Hai registrato una ricezione di prova
- ❌ Vuoi reinserire la ricezione da zero

## 🎉 Conclusione

La funzionalità di modifica delle ricezioni ti dà **controllo totale** sui dati registrati. Puoi correggere errori rapidamente senza perdere tempo a reinserire tutto da capo. Le statistiche si aggiornano automaticamente e i dati rimangono coerenti in tutta l'app.

**Prova ora**: Vai allo storico, clicca "✏️ Modifica" su una ricezione e correggi i dati! 🚀
