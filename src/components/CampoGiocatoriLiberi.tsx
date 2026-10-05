/**
 * Campo da gioco con giocatori posizionabili liberamente
 * NUOVO FILE - Solo visualizzazione, NON influenza i dati di scouting
 */

import React, { useState, useEffect, useRef } from 'react';
import './CampoGiocatoriLiberi.css';

interface Giocatore {
  id: number;
  name: string;
  zone: number;
}

interface PosizioneLibera {
  x: number; // percentuale 0-100 da sinistra
  y: number; // percentuale 0-100 dall'alto
}

interface CampoGiocatoriLiberiProps {
  giocatori: Giocatore[];
  giocatoreSelezionato?: number | null;
  onPlayerClick?: (playerIndex: number) => void;
}

const STORAGE_KEY = 'posizioni_giocatori_libere';

// Posizioni di default per le zone tradizionali (5, 6, 1)
const POSIZIONI_DEFAULT: Record<number, PosizioneLibera> = {
  5: { x: 17, y: 75 },  // zona 5 (sinistra-basso)
  6: { x: 50, y: 75 },  // zona 6 (centro-basso)
  1: { x: 83, y: 75 },  // zona 1 (destra-basso)
  4: { x: 17, y: 25 },  // zona 4 (sinistra-alto)
  3: { x: 50, y: 25 },  // zona 3 (centro-alto)
  2: { x: 83, y: 25 },  // zona 2 (destra-alto)
  7: { x: 17, y: 50 },  // zona 7 (sinistra-centro)
  8: { x: 50, y: 50 },  // zona 8 (centro)
  9: { x: 83, y: 50 },  // zona 9 (destra-centro)
};

export default function CampoGiocatoriLiberi({ 
  giocatori, 
  giocatoreSelezionato, 
  onPlayerClick 
}: CampoGiocatoriLiberiProps) {
  const campoRef = useRef<HTMLDivElement>(null);
  const [posizioniLibere, setPosizioniLibere] = useState<Record<string, PosizioneLibera>>(() => {
    try {
      const salvate = localStorage.getItem(STORAGE_KEY);
      if (salvate) {
        return JSON.parse(salvate);
      }
    } catch (error) {
      console.error('Errore nel caricamento posizioni:', error);
    }
    
    // Default: disposizione classica basata sulle zone dei giocatori
    const defaultPos: Record<string, PosizioneLibera> = {};
    giocatori.forEach((g, idx) => {
      const pos = POSIZIONI_DEFAULT[g.zone] || { x: 50, y: 50 };
      defaultPos[`g${idx}`] = pos;
    });
    return defaultPos;
  });

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Ref per tracciare le zone precedenti dei giocatori
  const zonePrecedentiRef = useRef<Record<number, number>>({});
  
  // Salvataggio in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posizioniLibere));
    } catch (error) {
      console.error('Errore nel salvataggio posizioni:', error);
    }
  }, [posizioniLibere]);
  
  // Aggiorna posizioni quando cambiano le zone dei giocatori
  useEffect(() => {
    const zonePrecedenti = zonePrecedentiRef.current;
    let zoneCambiate = false;
    const nuovePosizioni = { ...posizioniLibere };
    
    giocatori.forEach((giocatore, idx) => {
      const playerId = `g${idx}`;
      const zonaPrecedente = zonePrecedenti[idx];
      
      // Se la zona è cambiata, aggiorna la posizione
      if (zonaPrecedente !== undefined && zonaPrecedente !== giocatore.zone) {
        const nuovaPos = POSIZIONI_DEFAULT[giocatore.zone] || { x: 50, y: 50 };
        nuovePosizioni[playerId] = nuovaPos;
        zoneCambiate = true;
      }
      
      // Aggiorna il ref con la zona corrente
      zonePrecedenti[idx] = giocatore.zone;
    });
    
    // Se almeno una zona è cambiata, aggiorna le posizioni
    if (zoneCambiate) {
      setPosizioniLibere(nuovePosizioni);
    }
  }, [giocatori]);
  // Gestione drag & drop
  const handleMouseDown = (e: React.MouseEvent, playerId: string) => {
    e.preventDefault();
    const campo = campoRef.current;
    if (!campo) return;

    const rect = campo.getBoundingClientRect();
    const pos = posizioniLibere[playerId];
    if (!pos) return;

    const playerX = (pos.x / 100) * rect.width;
    const playerY = (pos.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - playerX,
      y: e.clientY - rect.top - playerY
    });
    setDragging(playerId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !campoRef.current) return;

    const rect = campoRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    let y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Limita tra 5% e 95% per evitare che esca dal campo
    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    setPosizioniLibere(prev => ({
      ...prev,
      [dragging]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent, playerId: string) => {
    const touch = e.touches[0];
    const campo = campoRef.current;
    if (!campo) return;

    const rect = campo.getBoundingClientRect();
    const pos = posizioniLibere[playerId];
    if (!pos) return;

    const playerX = (pos.x / 100) * rect.width;
    const playerY = (pos.y / 100) * rect.height;

    setDragOffset({
      x: touch.clientX - rect.left - playerX,
      y: touch.clientY - rect.top - playerY
    });
    setDragging(playerId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !campoRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = campoRef.current.getBoundingClientRect();
    let x = ((touch.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    let y = ((touch.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    setPosizioniLibere(prev => ({
      ...prev,
      [dragging]: { x, y }
    }));
  };

  const handleTouchEnd = () => {
    setDragging(null);
  };

  return (
    <div 
      className="campo-giocatori-liberi"
      ref={campoRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Rete */}
      <div className="rete-campo" />

      {/* Linee del campo */}
      <div className="linee-campo">
        <div className="linea-orizzontale" style={{ top: '33.33%' }} />
        <div className="linea-orizzontale" style={{ top: '66.66%' }} />
        <div className="linea-verticale" style={{ left: '33.33%' }} />
        <div className="linea-verticale" style={{ left: '66.66%' }} />
      </div>

      {/* Numeri delle zone */}
      <div className="zone-numeri">
        {[4, 3, 2, 7, 8, 9, 5, 6, 1].map((zona, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          return (
            <div
              key={zona}
              className="zona-numero"
              style={{
                top: `${row * 33.33 + 16.66}%`,
                left: `${col * 33.33 + 16.66}%`
              }}
            >
              {zona}
            </div>
          );
        })}
      </div>

      {/* Giocatori */}
      {giocatori.map((giocatore, idx) => {
        const playerId = `g${idx}`;
        const pos = posizioniLibere[playerId];
        if (!pos) return null;

        const isDragging = dragging === playerId;
        const isSelected = giocatoreSelezionato === idx;

        return (
          <div
            key={playerId}
            className={`giocatore-libero ${isDragging ? 'dragging' : ''} ${isSelected ? 'selezionato' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`
            }}
            onMouseDown={(e) => handleMouseDown(e, playerId)}
            onTouchStart={(e) => handleTouchStart(e, playerId)}
            onClick={() => onPlayerClick && onPlayerClick(idx)}
          >
            <div className="nome-giocatore">{giocatore.name}</div>
            <div className="zona-giocatore">Z.{giocatore.zone}</div>
          </div>
        );
      })}
    </div>
  );
}
