/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, History, RefreshCcw, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const MAX_NUMBER = 75;

export default function App() {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shuffleNumber, setShuffleNumber] = useState<number | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerConfetti = () => {
    const duration = 1.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#c5a059', '#2d2d2d', '#ffffff'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#c5a059', '#2d2d2d', '#ffffff'] });
    }, 400);

    // Initial smaller burst
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#c5a059', '#2d2d2d', '#ffffff'],
      disableForReducedMotion: true,
      gravity: 1.1,
      ticks: 200
    });
  };

  const drawNextNumber = useCallback(() => {
    if (drawnNumbers.length >= MAX_NUMBER || isDrawing) return;

    setIsDrawing(true);
    setResetConfirm(false);
    
    let startTime = Date.now();
    const duration = 2000;
    
    shuffleIntervalRef.current = setInterval(() => {
      const remaining = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1)
        .filter(n => !drawnNumbers.includes(n));
      
      if (remaining.length === 0) {
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        setIsDrawing(false);
        return;
      }
      
      const randomIcon = remaining[Math.floor(Math.random() * remaining.length)];
      setShuffleNumber(randomIcon);
      
      if (Date.now() - startTime > duration) {
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        
        const finalRemaining = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1)
          .filter(n => !drawnNumbers.includes(n));
        const picked = finalRemaining[Math.floor(Math.random() * finalRemaining.length)];
        
        setDrawnNumbers(prev => [picked, ...prev]);
        setCurrentNumber(picked);
        setIsDrawing(false);
        setShuffleNumber(null);
        triggerConfetti();
      }
    }, 80);
  }, [drawnNumbers, isDrawing]);

  const handleManualPick = (num: number) => {
    if (isDrawing || drawnNumbers.includes(num)) return;
    setDrawnNumbers(prev => [num, ...prev]);
    setCurrentNumber(num);
    triggerConfetti();
  };

  const resetGame = () => {
    // 1. Kill any active shuffle intervals immediately
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
    
    // 2. Reset all state
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setIsDrawing(false);
    setShuffleNumber(null);
    setResetConfirm(false);
  };

  return (
    <div className="h-screen w-screen bg-bg-warm flex flex-col md:flex-row overflow-hidden font-serif selection:bg-gold/10">
      {/* Main Panel - Optimized to fit single screen */}
      <main className="flex-[3] lg:flex-[4] flex flex-col items-center justify-between p-4 lg:p-8 border-b md:border-b-0 md:border-r border-accent-light relative h-full overflow-hidden">
        
        {/* Header - Balanced Scale */}
        <header className="text-center w-full pt-2">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold text-3xl lg:text-5xl tracking-[0.3em] uppercase font-light leading-tight mb-1"
          >
            Chen Ting & Chang Ling
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-ink/40 italic text-md lg:text-xl tracking-[0.2em]"
          >
            Wedding Bingo Celebration
          </motion.p>
        </header>

        {/* Scaled Ball Display - Guaranteed to fit */}
        <div className="flex-1 flex items-center justify-center w-full max-h-[45vh] lg:max-h-[50vh] my-2">
          <motion.div 
            className="aspect-square h-full max-h-[38vh] lg:max-h-[45vh] rounded-full border-[5px] border-gold flex items-center justify-center relative bg-[radial-gradient(circle_at_30%_30%,#fff_0%,#fcfaf7_100%)] shadow-[0_40px_100px_rgba(197,160,89,0.25)]"
            animate={isDrawing ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <div className={`absolute -inset-6 rounded-full border-[3px] border-dashed border-gold/15 animate-spin-slow pointer-events-none transition-opacity duration-1000 ${isDrawing ? 'opacity-100' : 'opacity-30'}`} />
            
            <AnimatePresence mode="wait">
              {isDrawing ? (
                <motion.div
                  key="shuffling"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="text-8xl lg:text-[10rem] font-serif font-black text-gold/30 tabular-nums z-10"
                >
                  {shuffleNumber ?? "?"}
                </motion.div>
              ) : currentNumber ? (
                <motion.div
                  key={`number-${currentNumber}`}
                  initial={{ opacity: 0, scale: 0.2, rotate: 180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 150 }}
                  className="w-full h-full flex items-center justify-center text-[18vh] lg:text-[24vh] font-serif font-bold text-ink drop-shadow-[5px_5px_0px_rgba(197,160,89,0.15)] leading-none tabular-nums select-none z-10"
                >
                  {currentNumber}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-accent-light z-10"
                >
                  <Trophy className="w-20 h-20 lg:w-28 lg:h-28 opacity-20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Action Controls - Scaled down for one-page fit */}
        <div className="flex flex-col items-center gap-3 w-full pb-4">
          <button
            onClick={drawNextNumber}
            disabled={isDrawing || drawnNumbers.length >= MAX_NUMBER}
            className={`
              w-full max-w-xl py-5 lg:py-7 bg-ink text-white font-sans text-lg lg:text-xl tracking-[0.5em] uppercase rounded-sm border-2 border-ink
              transition-all duration-500 active:scale-[0.98] shadow-xl shadow-ink/20
              hover:bg-gold hover:text-white hover:border-gold disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer
            `}
          >
            {isDrawing ? "Drawing..." : drawnNumbers.length >= MAX_NUMBER ? "Registry Full" : "Draw Number"}
          </button>

          <button 
            onClick={resetGame}
            disabled={isDrawing}
            className="text-ink/30 hover:text-rose-500 text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-300 flex items-center gap-2 group p-2 disabled:opacity-0"
          >
            <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" /> 
            Reset Registry
          </button>
        </div>

        <footer className="absolute bottom-4 left-6 text-[10px] uppercase tracking-[0.6em] text-ink/10 font-sans font-black">
          {drawnNumbers.length} / {MAX_NUMBER}
        </footer>
      </main>

      {/* Registry Panel - Optimized to fit without scrolling */}
      <aside className="w-full md:w-[320px] lg:w-[400px] bg-white p-4 lg:p-6 flex flex-col h-full border-t md:border-t-0 border-accent-light shadow-2xl z-10">
        <h2 className="text-base text-center text-gold font-sans font-medium tracking-[0.5em] uppercase pb-3 mb-3 border-b border-accent-light flex-none">
          Live Registry
        </h2>

        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-5 grid-rows-[repeat(15,minmax(0,1fr))] gap-2 lg:gap-3 h-full">
            {Array.from({ length: MAX_NUMBER }, (_, i) => i + 1).map((num) => {
              const isDrawn = drawnNumbers.includes(num);
              const isLatest = drawnNumbers[0] === num;
              
              return (
                <motion.button
                  key={num}
                  disabled={isDrawing}
                  onClick={() => handleManualPick(num)}
                  className={`
                    w-full h-full flex items-center justify-center text-sm lg:text-base border rounded-sm transition-all duration-500 font-sans
                    ${isLatest 
                      ? 'bg-ink text-white border-ink shadow-lg scale-110 z-10 font-bold' 
                      : isDrawn 
                        ? 'bg-gold text-white border-gold opacity-100 shadow-sm' 
                        : 'border-accent-light text-ink/15 hover:border-gold/50 hover:text-gold/50'}
                    ${isDrawing ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {num}
                </motion.button>
              );
            })}
          </div>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e8dfd1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
