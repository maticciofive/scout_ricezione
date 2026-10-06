# Modifica Zona di Ricezione - Guida Completa

## 🎯 Funzionalità Aggiunta

Ora nel modal di modifica delle ricezioni puoi modificare anche la **zona di ricezione** (la zona del campo dove il giocatore riceve la palla).

## 📝 Campi Modificabili (Aggiornato)

Nel modal di modifica puoi ora cambiare:
1. **📍 Zona di Provenienza Battuta** (Zona 1, 6, 5)
2. **🏐 Tipo di Battuta** (Float, Salto Float, Salto Spin, Splot, Flin)
3. **👤 Giocatore** che ha ricevuto
4. **📍 Zona di Ricezione** (Zone 1-9) ← **NUOVO**
5. **🤲 Fondamentale** (Bagher, Palleggio)
6. **🎯 Direzione** dove ha colpito la palla (▲ ◀ ● ▶ ▼)
7. **✅ Esito** della ricezione (# + ! - / =)
8. **⚡ Velocità** della battuta (km/h)

## 🗺️ Mappa delle Zone

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

## 🎨 Interfaccia del Selettore Zona

Il selettore mostra tutte le 9 zone in una griglia 3x3:

```
┌─────────────────────────────────────────┐
│  📍 Zona di Ricezione                    │
├─────────────────────────────────────────┤
│  [Zona 4] [Zona 3] [Zona 2]             │
│  [Zona 7] [Zona 8] [Zona 9]             │
│  [Zona 5] [Zona 6] [Zona 1]             │
│                                          │
│  Lato: Sinistra                          │
└─────────────────────────────────────────┘
```

### Feedback Visivo
- **Zona selezionata**: Sfondo blu (#2563eb), testo bianco, bordo scuro
- **Zona non selezionata**: Sfondo grigio (#f3f4f6), testo scuro, bordo chiaro
- **Indicatore lato**: Mostra automaticamente il lato (Sinistra/Centro/Destra) in base alla zona selezionata

## 🔄 Come Funziona

### 1. Apri il Modal di Modifica
- Clicca "✏️ Modifica" su una ricezione nello storico

### 2. Seleziona la Zona di Ricezione
- Clicca sulla zona desiderata (1-9)
- Il sistema mostra automaticamente il lato corrispondente

### 3. Salva le Modifiche
- Clicca "💾 Salva Modifiche"
- Il sistema aggiorna:
  - ✅ `zone`: La zona selezionata
  - ✅ `side`: Calcolato automaticamente dalla zona (Sinistra/Centro/Destra)

## 📊 Esempio Pratico

### Scenario: Errore nella Zona di Ricezione

**Ricezione Originale:**
```
Giocatore: VOLPE
Zona Ricezione: 5 (Sinistra) ← ERRORE
Zona Battuta: 1
Tipo Battuta: Float
Fondamentale: Bagher
Direzione: Davanti
Esito: +
```

**Correzione:**
1. Clicca "✏️ Modifica"
2. Seleziona "Zona 6" invece di "Zona 5"
3. Il sistema mostra: "Lato: Centro"
4. Clicca "💾 Salva Modifiche"

**Ricezione Aggiornata:**
```
Giocatore: VOLPE
Zona Ricezione: 6 (Centro) ← CORRETTO
Zona Battuta: 1
Tipo Battuta: Float
Fondamentale: Bagher
Direzione: Davanti
Esito: +
```

### Impatto sulle Statistiche

**Prima della modifica:**
- Statistiche Zona Sinistra: +1 ricezione
- Statistiche Zona Centro: 0 ricezioni

**Dopo la modifica:**
- Statistiche Zona Sinistra: 0 ricezioni
- Statistiche Zona Centro: +1 ricezione

Tutte le tabelle si aggiornano automaticamente:
- ✅ Punto di Ricezione per Lato
- ✅ Statistiche per Esito - BAGHER/PALLEGGIO
- ✅ Resoconto Analisi
- ✅ Tabella Direzione × Esito per Lato

## 🔧 Dettagli Tecnici

### Modifiche al Codice

**1. Stato di Modifica**
```typescript
const [editForm, setEditForm] = useState<Partial<Reception>>({});
```

**2. Inizializzazione Form**
```typescript
const startEditReception = (reception: Reception) => {
  setEditingReception(reception);
  setEditForm({
    serveZone: reception.serveZone,
    serveType: reception.serveType,
    playerIndex: reception.playerIndex,
    zone: reception.zone, // ← NUOVO
    fundamental: reception.fundamental,
    direction: reception.direction,
    outcome: reception.outcome,
    speed: reception.speed,
  });
};
```

**3. Salvataggio Modifiche**
```typescript
const saveEditReception = () => {
  if (!editingReception) return;
  
  // Usa la zone dal form se presente, altrimenti calcolala dal giocatore
  const zone = editForm.zone !== undefined 
    ? editForm.zone 
    : (players[editForm.playerIndex || 0]?.zone || editingReception.zone);
  
  const updatedReception: Reception = {
    ...editingReception,
    ...editForm,
    playerName: players[editForm.playerIndex || 0]?.name || editingReception.playerName,
    zone: zone,
    side: getSideForZone(zone), // ← Calcolato dalla zona selezionata
  };
  
  setReceptions(prev => prev.map(r => r.id === editingReception.id ? updatedReception : r));
  setEditingReception(null);
  setEditForm({});
};
```

**4. Selettore UI**
```tsx
{/* Zona di Ricezione */}
<div style={{ marginBottom: '16px' }}>
  <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
    📍 Zona di Ricezione
  </label>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
    {ALL_ZONES.map(zone => (
      <button
        key={zone}
        onClick={() => setEditForm(prev => ({ ...prev, zone: zone }))}
        style={{
          padding: '10px',
          background: editForm.zone === zone ? '#2563eb' : '#f3f4f6',
          color: editForm.zone === zone ? '#fff' : '#374151',
          border: editForm.zone === zone ? '2px solid #1d4ed8' : '2px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        Zona {zone}
      </button>
    ))}
  </div>
  <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
    Lato: {getSideForZone(editForm.zone || editingReception?.zone || 0)}
  </p>
</div>
```

## 💡 Casi d'Uso

### Caso 1: Zona Sbagliata
**Problema**: Hai registrato la ricezione in Zona 5 ma era in Zona 6

**Soluzione**:
1. Clicca "✏️ Modifica"
2. Seleziona "Zona 6"
3. Salva

**Risultato**: La ricezione viene spostata da Sinistra a Centro

### Caso 2: Giocatore Spostato
**Problema**: Il giocatore si è spostato durante l'azione

**Soluzione**:
1. Clicca "✏️ Modifica"
2. Cambia la zona di ricezione
3. Salva

**Risultato**: Le statistiche riflettono la posizione reale

### Caso 3: Errore di Digitazione
**Problema**: Hai cliccato sulla zona sbagliata

**Soluzione**:
1. Clicca "✏️ Modifica"
2. Seleziona la zona corretta
3. Salva

**Risultato**: Dati corretti senza dover reinserire tutto

## 🎯 Vantaggi

1. **Precisione**: Puoi correggere errori di zona senza reinserire tutto
2. **Flessibilità**: Modifica qualsiasi campo in qualsiasi momento
3. **Coerenza**: Il lato (Sinistra/Centro/Destra) si aggiorna automaticamente
4. **Efficienza**: Risparmia tempo rispetto a cancellare e reinserire
5. **Tracciabilità**: L'ID della ricezione rimane invariato

## 📱 Responsive Design

### Mobile
- Griglia 3x3 adattiva
- Pulsanti touch-friendly
- Scroll verticale per il modal

### Desktop
- Griglia 3x3 con pulsanti più grandi
- Modal centrato con larghezza massima
- Tutti i campi visibili senza scroll

## ✅ Build Status

```
✓ 47 modules transformed
✓ dist/assets/index-BohZPSJp.js: 596.91 kB (gzip: 185.28 kB)
✓ dist/assets/index-CmeCT_OB.css: 24.11 kB (gzip: 4.72 kB)
✓ built in 4.64s
```

**Build completato con successo** ✅

## 📝 File Modificati

**`src/App.tsx`**:
- Aggiunto campo `zone` al form di modifica
- Aggiornata funzione `startEditReception` per includere la zona
- Aggiornata funzione `saveEditReception` per usare la zona dal form
- Aggiunto selettore zona di ricezione nel modal
- Aggiunto indicatore del lato (Sinistra/Centro/Destra)

## 🚀 Come Usare

1. **Trova la ricezione** nello storico
2. **Clicca "✏️ Modifica"**
3. **Seleziona la zona** corretta nella griglia 3x3
4. **Verifica il lato** mostrato sotto il selettore
5. **Clicca "💾 Salva Modifiche"**
6. **Controlla le statistiche** che si aggiornano automaticamente

## 🎉 Conclusione

Ora hai **controllo completo** su tutti i campi della ricezione, inclusa la zona di ricezione. Puoi correggere qualsiasi errore rapidamente e con precisione, mantenendo la coerenza dei dati in tutta l'applicazione.

**Prova ora**: Vai allo storico, clicca "✏️ Modifica" e prova a cambiare la zona di ricezione! 🚀
