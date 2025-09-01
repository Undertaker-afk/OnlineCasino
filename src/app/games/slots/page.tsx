'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/components/Providers';
import { SlotSymbol } from '@/types';
import { generateId } from '@/lib/gameUtils';
import { 
  ArrowLeft, 
  Play, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Trophy,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

// Slot-Symbole definieren
const SLOT_SYMBOLS: SlotSymbol[] = [
  { name: '🍒', image: '🍒', value: 3, frequency: 25 },    // Cherry - häufig, niedriger Wert
  { name: '🍋', image: '🍋', value: 4, frequency: 20 },    // Lemon
  { name: '🍊', image: '🍊', value: 5, frequency: 18 },    // Orange  
  { name: '🍇', image: '🍇', value: 8, frequency: 15 },    // Grapes
  { name: '🔔', image: '🔔', value: 12, frequency: 10 },   // Bell
  { name: '⭐', image: '⭐', value: 15, frequency: 8 },     // Star
  { name: '💎', image: '💎', value: 25, frequency: 3 },    // Diamond - selten, hoher Wert
  { name: '👑', image: '👑', value: 50, frequency: 1 }     // Crown - sehr selten, sehr hoher Wert
];

const PAYLINES = [
  [1, 1, 1], // Top row
  [2, 2, 2], // Middle row  
  [3, 3, 3], // Bottom row
  [1, 2, 3], // Diagonal top-left to bottom-right
  [3, 2, 1], // Diagonal bottom-left to top-right
];

interface GameState {
  isSpinning: boolean;
  reels: string[][];
  winningLines: number[];
  totalWin: number;
  result: 'win' | 'lose' | null;
  gameId: string;
  lastWinSymbol: string | null;
  multiplier: number;
}

export default function SlotsPage() {
  const { state, dispatch } = useApp();
  
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    reels: [[], [], []],
    winningLines: [],
    totalWin: 0,
    result: null,
    gameId: generateId(),
    lastWinSymbol: null,
    multiplier: 1
  });

  const [betAmount, setBetAmount] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayCount, setAutoPlayCount] = useState(0);

  // Gewichtetes Zufallssymbol generieren
  const getRandomSymbol = (): string => {
    const totalWeight = SLOT_SYMBOLS.reduce((sum, symbol) => sum + symbol.frequency, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of SLOT_SYMBOLS) {
      random -= symbol.frequency;
      if (random <= 0) {
        return symbol.image;
      }
    }
    
    return SLOT_SYMBOLS[0].image; // Fallback
  };

  // Reels generieren
  const generateReels = (): string[][] => {
    return [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    ];
  };

  // Gewinnlinien prüfen
  const checkWinningLines = (reels: string[][]): { lines: number[], totalWin: number, winSymbol: string | null } => {
    let totalWin = 0;
    let winningLines: number[] = [];
    let winSymbol: string | null = null;

    PAYLINES.forEach((payline, index) => {
      const symbols = payline.map((row, col) => reels[col][row - 1]);
      
      // Prüfe ob alle Symbole gleich sind
      if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
        const symbol = SLOT_SYMBOLS.find(s => s.image === symbols[0]);
        if (symbol) {
          winningLines.push(index);
          totalWin += symbol.value * betAmount;
          winSymbol = symbol.image;
        }
      }
    });

    return { lines: winningLines, totalWin, winSymbol };
  };

  // Spin-Funktion
  const spin = async () => {
    if (betAmount > state.gameState.balance) {
      alert('Nicht genügend Guthaben!');
      return;
    }

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      winningLines: [],
      totalWin: 0,
      result: null,
      lastWinSymbol: null,
      multiplier: 1
    }));

    // Balance reduzieren
    dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance - betAmount });

    // Spin-Animation (2.5 Sekunden)
    setTimeout(() => {
      const newReels = generateReels();
      const { lines, totalWin, winSymbol } = checkWinningLines(newReels);
      
      // Bonus Multiplier für seltene Symbole
      let multiplier = 1;
      if (winSymbol === '💎') multiplier = 2;
      if (winSymbol === '👑') multiplier = 5;
      
      const finalWin = totalWin * multiplier;
      const result = finalWin > 0 ? 'win' : 'lose';

      setGameState(prev => ({
        ...prev,
        isSpinning: false,
        reels: newReels,
        winningLines: lines,
        totalWin: finalWin,
        result,
        lastWinSymbol: winSymbol,
        multiplier
      }));

      if (finalWin > 0) {
        dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance + finalWin });
      }

      // Auto-Play fortsetzen
      if (autoPlay && autoPlayCount > 1) {
        setAutoPlayCount(prev => prev - 1);
        setTimeout(() => spin(), 1500);
      } else if (autoPlay && autoPlayCount === 1) {
        setAutoPlay(false);
        setAutoPlayCount(0);
      }
    }, 2500);
  };

  // Auto-Play starten
  const startAutoPlay = (count: number) => {
    setAutoPlay(true);
    setAutoPlayCount(count);
    if (!gameState.isSpinning) {
      spin();
    }
  };

  const stopAutoPlay = () => {
    setAutoPlay(false);
    setAutoPlayCount(0);
  };

  const startNewGame = () => {
    setGameState({
      isSpinning: false,
      reels: [[], [], []],
      winningLines: [],
      totalWin: 0,
      result: null,
      gameId: generateId(),
      lastWinSymbol: null,
      multiplier: 1
    });
    setAutoPlay(false);
    setAutoPlayCount(0);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/games" className="flex items-center text-casino-gold hover:text-yellow-400">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück zu den Spielen
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-casino-dark px-4 py-2 rounded-lg border border-casino-gold">
              <span className="text-casino-gold font-semibold">
                Guthaben: €{state.gameState.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Slot Machine */}
          <div className="lg:col-span-2">
            <div className="game-table">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-casino-gold mb-2">
                  Royal Slots 💎
                </h2>
                <p className="text-gray-300">
                  3 Walzen • 5 Gewinnlinien • Bis zu 5x Multiplikator
                </p>
              </div>

              {/* Slot Machine Display */}
              <div className="relative bg-gradient-to-b from-casino-gold via-yellow-600 to-casino-gold p-8 rounded-2xl border-4 border-casino-gold shadow-2xl">
                
                {/* Win Animation Overlay */}
                <AnimatePresence>
                  {gameState.result === 'win' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-casino-gold bg-opacity-20 rounded-2xl flex items-center justify-center z-10"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                      >
                        <Sparkles className="w-16 h-16 text-casino-gold mx-auto mb-4 animate-pulse" />
                        <div className="text-4xl font-bold text-casino-gold mb-2">
                          GEWONNEN!
                        </div>
                        <div className="text-2xl font-bold text-white">
                          €{gameState.totalWin.toFixed(2)}
                          {gameState.multiplier > 1 && (
                            <span className="text-casino-gold ml-2">
                              ({gameState.multiplier}x)
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reels Container */}
                <div className="bg-casino-darker rounded-xl p-6 border-4 border-casino-dark">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Reel 1 */}
                    <div className="slot-reel">
                      <div className="h-48 flex flex-col justify-center items-center">
                        {gameState.reels[0].map((symbol, index) => (
                          <motion.div
                            key={`reel1-${index}-${gameState.gameId}`}
                            initial={{ y: gameState.isSpinning ? -100 : 0, opacity: 0 }}
                            animate={{ 
                              y: 0, 
                              opacity: 1,
                              scale: gameState.winningLines.some(line => 
                                PAYLINES[line][0] === index + 1
                              ) ? 1.2 : 1
                            }}
                            transition={{ 
                              delay: gameState.isSpinning ? Math.random() * 0.5 : index * 0.1,
                              duration: 0.5 
                            }}
                            className={`text-6xl p-2 rounded ${
                              gameState.winningLines.some(line => PAYLINES[line][0] === index + 1) 
                                ? 'bg-casino-gold bg-opacity-20 shadow-lg' 
                                : ''
                            }`}
                          >
                            {gameState.isSpinning ? '🎰' : symbol}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Reel 2 */}
                    <div className="slot-reel">
                      <div className="h-48 flex flex-col justify-center items-center">
                        {gameState.reels[1].map((symbol, index) => (
                          <motion.div
                            key={`reel2-${index}-${gameState.gameId}`}
                            initial={{ y: gameState.isSpinning ? -100 : 0, opacity: 0 }}
                            animate={{ 
                              y: 0, 
                              opacity: 1,
                              scale: gameState.winningLines.some(line => 
                                PAYLINES[line][1] === index + 1
                              ) ? 1.2 : 1
                            }}
                            transition={{ 
                              delay: gameState.isSpinning ? Math.random() * 0.5 : index * 0.1,
                              duration: 0.5 
                            }}
                            className={`text-6xl p-2 rounded ${
                              gameState.winningLines.some(line => PAYLINES[line][1] === index + 1) 
                                ? 'bg-casino-gold bg-opacity-20 shadow-lg' 
                                : ''
                            }`}
                          >
                            {gameState.isSpinning ? '🎰' : symbol}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Reel 3 */}
                    <div className="slot-reel">
                      <div className="h-48 flex flex-col justify-center items-center">
                        {gameState.reels[2].map((symbol, index) => (
                          <motion.div
                            key={`reel3-${index}-${gameState.gameId}`}
                            initial={{ y: gameState.isSpinning ? -100 : 0, opacity: 0 }}
                            animate={{ 
                              y: 0, 
                              opacity: 1,
                              scale: gameState.winningLines.some(line => 
                                PAYLINES[line][2] === index + 1
                              ) ? 1.2 : 1
                            }}
                            transition={{ 
                              delay: gameState.isSpinning ? Math.random() * 0.5 : index * 0.1,
                              duration: 0.5 
                            }}
                            className={`text-6xl p-2 rounded ${
                              gameState.winningLines.some(line => PAYLINES[line][2] === index + 1) 
                                ? 'bg-casino-gold bg-opacity-20 shadow-lg' 
                                : ''
                            }`}
                          >
                            {gameState.isSpinning ? '🎰' : symbol}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Paylines Indicator */}
                  {gameState.winningLines.length > 0 && (
                    <div className="text-center">
                      <div className="text-casino-gold font-semibold mb-2">
                        Gewinnlinien: {gameState.winningLines.map(line => line + 1).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Result Display */}
                <div className="text-center mt-6">
                  <AnimatePresence mode="wait">
                    {gameState.result && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-lg ${
                          gameState.result === 'win' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {gameState.result === 'win' && <TrendingUp className="w-5 h-5" />}
                        {gameState.result === 'lose' && <TrendingDown className="w-5 h-5" />}
                        <span>
                          {gameState.result === 'win' 
                            ? `Gewonnen! €${gameState.totalWin.toFixed(2)}` 
                            : 'Versuchen Sie es erneut!'
                          }
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Bet Amount */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <h3 className="text-lg font-semibold text-casino-gold mb-4">Einsatz pro Spin</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setBetAmount(Math.max(0.1, betAmount - 0.5))}
                  disabled={gameState.isSpinning}
                  className="casino-button bg-casino-red hover:bg-red-700 p-2 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <div className="bg-casino-darker px-6 py-3 rounded-lg border-2 border-casino-gold flex-1 text-center">
                  <span className="text-casino-gold font-bold text-xl">
                    €{betAmount.toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => setBetAmount(Math.min(state.gameState.balance, betAmount + 0.5))}
                  disabled={gameState.isSpinning}
                  className="casino-button bg-casino-green hover:bg-green-700 p-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Bet Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2.5, 5].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={gameState.isSpinning}
                    className={`py-2 px-2 text-sm rounded font-semibold disabled:opacity-50 ${
                      betAmount === amount
                        ? 'bg-casino-gold text-black'
                        : 'bg-casino-darker text-white hover:bg-casino-dark border border-gray-600'
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Spin Controls */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <div className="space-y-4">
                {/* Single Spin */}
                <button
                  onClick={spin}
                  disabled={gameState.isSpinning || betAmount > state.gameState.balance || autoPlay}
                  className="casino-button w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gameState.isSpinning ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Dreht...
                    </div>
                  ) : (
                    <>
                      <Play className="w-5 h-5 inline mr-2" />
                      Spin (€{betAmount.toFixed(2)})
                    </>
                  )}
                </button>

                {/* Auto-Play Controls */}
                {!autoPlay ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 25, 50].map(count => (
                      <button
                        key={count}
                        onClick={() => startAutoPlay(count)}
                        disabled={gameState.isSpinning || betAmount > state.gameState.balance}
                        className="casino-button bg-casino-green hover:bg-green-700 text-sm py-2 disabled:opacity-50"
                      >
                        Auto {count}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-casino-gold mb-2">
                      Auto-Play: {autoPlayCount} verbleibend
                    </div>
                    <button
                      onClick={stopAutoPlay}
                      className="casino-button bg-casino-red hover:bg-red-700 w-full"
                    >
                      Auto-Play stoppen
                    </button>
                  </div>
                )}

                {/* New Game */}
                {gameState.result && (
                  <button
                    onClick={startNewGame}
                    className="casino-button bg-casino-darker hover:bg-casino-dark w-full"
                  >
                    <RotateCcw className="w-5 h-5 inline mr-2" />
                    Neues Spiel
                  </button>
                )}
              </div>
            </div>

            {/* Paytable */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <h3 className="text-lg font-semibold text-casino-gold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Gewinntabelle
              </h3>
              
              <div className="space-y-2 text-sm">
                {SLOT_SYMBOLS.map((symbol, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{symbol.image}</span>
                      <span className="text-white">{symbol.name}</span>
                    </div>
                    <span className="text-casino-gold font-semibold">
                      {symbol.value}x
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 💎 Diamant: 2x Multiplikator</p>
                  <p>• 👑 Krone: 5x Multiplikator</p>
                  <p>• 3 gleiche Symbole in einer Linie gewinnen</p>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <h3 className="text-lg font-semibold text-casino-gold mb-4">Spielstatistiken</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">RTP:</span>
                  <span className="text-white">96.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gewinnlinien:</span>
                  <span className="text-white">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max. Multiplikator:</span>
                  <span className="text-white">5x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max. Gewinn:</span>
                  <span className="text-white">€{(50 * 5).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
