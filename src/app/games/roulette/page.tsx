'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/components/Providers';
import { RouletteBet } from '@/types';
import { 
  calculateRouletteWin, 
  getRouletteNumberProperties, 
  generateId 
} from '@/lib/gameUtils';
import { saveGameSession } from '@/lib/gameSessionStorage';
import { 
  ArrowLeft, 
  Play, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';

interface GameState {
  isSpinning: boolean;
  winningNumber: number | null;
  result: 'win' | 'lose' | null;
  winAmount: number;
  gameId: string;
}

export default function RoulettePage() {
  const { state, dispatch } = useApp();
  
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    winningNumber: null,
    result: null,
    winAmount: 0,
    gameId: generateId()
  });

  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [selectedBetAmount, setSelectedBetAmount] = useState(5);

  // Roulette Zahlen (0-36)
  const rouletteNumbers = Array.from({ length: 37 }, (_, i) => i);
  
  // Rote und schwarze Zahlen
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  const getNumberColor = (num: number) => {
    if (num === 0) return 'green';
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const addBet = (betType: RouletteBet['type'], betValue: string, odds: number) => {
    if (gameState.isSpinning) return;
    
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0) + selectedBetAmount;
    if (totalBetAmount > state.gameState.balance) {
      alert('Nicht genügend Guthaben!');
      return;
    }

    const existingBetIndex = bets.findIndex(bet => 
      bet.type === betType && bet.value === betValue
    );

    if (existingBetIndex >= 0) {
      // Einsatz erhöhen
      const newBets = [...bets];
      newBets[existingBetIndex].amount += selectedBetAmount;
      setBets(newBets);
    } else {
      // Neuen Einsatz hinzufügen
      const newBet: RouletteBet = {
        type: betType,
        value: betValue,
        amount: selectedBetAmount,
        odds
      };
      setBets([...bets, newBet]);
    }
  };

  const clearBets = () => {
    setBets([]);
  };

  const spin = async () => {
    if (bets.length === 0) {
      alert('Bitte platzieren Sie mindestens einen Einsatz!');
      return;
    }

    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      winningNumber: null,
      result: null,
      winAmount: 0
    }));

    // Balance reduzieren
    dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance - totalBetAmount });

    // Spin-Animation (3 Sekunden)
    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 37);
      let totalWin = 0;

      bets.forEach(bet => {
        const win = calculateRouletteWin(bet.type, bet.value, winningNumber, bet.amount);
        totalWin += win;
      });

      const result = totalWin > 0 ? 'win' : 'lose';

      setGameState(prev => ({
        ...prev,
        isSpinning: false,
        winningNumber,
        result,
        winAmount: totalWin
      }));

      if (totalWin > 0) {
        dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance + totalWin });
      }

      // Spielsitzung speichern
      saveGameSession({
        gameType: 'roulette',
        betAmount: totalBetAmount,
        winAmount: totalWin,
        result: result
      });
    }, 3000);
  };

  const startNewGame = () => {
    setGameState({
      isSpinning: false,
      winningNumber: null,
      result: null,
      winAmount: 0,
      gameId: generateId()
    });
    setBets([]);
  };

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
          {/* Roulette Wheel */}
          <div className="lg:col-span-2">
            <div className="game-table">
              <h2 className="text-3xl font-bold text-casino-gold mb-6 text-center">
                Europäisches Roulette
              </h2>

              {/* Wheel Container */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div
                    className="roulette-wheel w-64 h-64 bg-gradient-to-br from-casino-gold via-yellow-600 to-casino-gold flex items-center justify-center"
                    animate={{ rotate: gameState.isSpinning ? 1440 : 0 }}
                    transition={{ 
                      duration: gameState.isSpinning ? 3 : 0, 
                      ease: "easeOut" 
                    }}
                  >
                    {/* Wheel Numbers */}
                    <div className="absolute inset-4 bg-casino-dark rounded-full flex items-center justify-center">
                      <div className="text-4xl font-bold text-casino-gold">
                        {gameState.winningNumber !== null ? gameState.winningNumber : '?'}
                      </div>
                    </div>
                    
                    {/* Wheel Sectors */}
                    {[...Array(37)].map((_, i) => {
                      const angle = (i * 360) / 37;
                      const color = getNumberColor(i);
                      return (
                        <div
                          key={i}
                          className={`absolute w-2 h-8 ${
                            color === 'red' ? 'bg-red-500' : 
                            color === 'black' ? 'bg-black' : 'bg-green-500'
                          }`}
                          style={{
                            transformOrigin: 'center bottom',
                            transform: `rotate(${angle}deg) translateY(-120px)`
                          }}
                        />
                      );
                    })}
                  </motion.div>
                  
                  {/* Ball */}
                  <motion.div
                    className="absolute top-2 left-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                    animate={{ 
                      rotate: gameState.isSpinning ? -1800 : 0,
                      scale: gameState.isSpinning ? [1, 0.8, 1] : 1
                    }}
                    transition={{ 
                      duration: gameState.isSpinning ? 3 : 0,
                      ease: "easeOut"
                    }}
                    style={{ transformOrigin: '50% 128px' }}
                  />
                </div>
              </div>

              {/* Result Display */}
              <div className="text-center mb-8">
                <AnimatePresence mode="wait">
                  {gameState.result && gameState.winningNumber !== null && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-6xl font-bold text-casino-gold">
                        {gameState.winningNumber}
                      </div>
                      <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-lg ${
                        gameState.result === 'win' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {gameState.result === 'win' && <TrendingUp className="w-5 h-5" />}
                        {gameState.result === 'lose' && <TrendingDown className="w-5 h-5" />}
                        <span>
                          {gameState.result === 'win' 
                            ? `Gewonnen! +€${gameState.winAmount.toFixed(2)}` 
                            : 'Verloren!'
                          }
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Betting Table */}
              <div className="bg-casino-table rounded-lg p-6 border-4 border-casino-gold">
                <h3 className="text-xl font-bold text-white mb-4">Setzen Sie Ihre Einsätze</h3>
                
                {/* Numbers Grid */}
                <div className="grid grid-cols-13 gap-1 mb-6">
                  {/* Zero */}
                  <button
                    onClick={() => addBet('number', '0', 35)}
                    disabled={gameState.isSpinning}
                    className="col-span-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded disabled:opacity-50"
                  >
                    0
                  </button>
                  
                  {/* Numbers 1-36 */}
                  {Array.from({ length: 36 }, (_, i) => i + 1).map(num => {
                    const color = getNumberColor(num);
                    return (
                      <button
                        key={num}
                        onClick={() => addBet('number', num.toString(), 35)}
                        disabled={gameState.isSpinning}
                        className={`h-12 ${
                          color === 'red' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        } text-white font-bold rounded disabled:opacity-50`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Outside Bets */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
                  <button
                    onClick={() => addBet('color', 'red', 1)}
                    disabled={gameState.isSpinning}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
                  >
                    Rot (2:1)
                  </button>
                  
                  <button
                    onClick={() => addBet('color', 'black', 1)}
                    disabled={gameState.isSpinning}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
                  >
                    Schwarz (2:1)
                  </button>
                  
                  <button
                    onClick={() => addBet('odd_even', 'odd', 1)}
                    disabled={gameState.isSpinning}
                    className="bg-casino-dark hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded border border-casino-gold disabled:opacity-50"
                  >
                    Ungerade (2:1)
                  </button>
                  
                  <button
                    onClick={() => addBet('odd_even', 'even', 1)}
                    disabled={gameState.isSpinning}
                    className="bg-casino-dark hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded border border-casino-gold disabled:opacity-50"
                  >
                    Gerade (2:1)
                  </button>
                  
                  <button
                    onClick={() => addBet('high_low', 'low', 1)}
                    disabled={gameState.isSpinning}
                    className="bg-casino-dark hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded border border-casino-gold disabled:opacity-50"
                  >
                    1-18 (2:1)
                  </button>
                  
                  <button
                    onClick={() => addBet('high_low', 'high', 1)}
                    disabled={gameState.isSpinning}
                    className="bg-casino-dark hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded border border-casino-gold disabled:opacity-50"
                  >
                    19-36 (2:1)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Bet Amount Selector */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <h3 className="text-lg font-semibold text-casino-gold mb-4">Einsatz wählen</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setSelectedBetAmount(Math.max(1, selectedBetAmount - 5))}
                  className="casino-button bg-casino-red hover:bg-red-700 p-2"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <div className="bg-casino-darker px-6 py-3 rounded-lg border-2 border-casino-gold flex-1 text-center">
                  <span className="text-casino-gold font-bold text-xl">
                    €{selectedBetAmount}
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedBetAmount(Math.min(state.gameState.balance, selectedBetAmount + 5))}
                  className="casino-button bg-casino-green hover:bg-green-700 p-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Bet Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 25].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedBetAmount(amount)}
                    className={`py-2 px-3 rounded font-semibold ${
                      selectedBetAmount === amount
                        ? 'bg-casino-gold text-black'
                        : 'bg-casino-darker text-white hover:bg-casino-dark border border-gray-600'
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Bets */}
            {bets.length > 0 && (
              <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
                <h3 className="text-lg font-semibold text-casino-gold mb-4">Ihre Einsätze</h3>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {bets.map((bet, index) => (
                    <div key={index} className="flex justify-between items-center bg-casino-darker p-3 rounded">
                      <div className="text-white">
                        <div className="font-semibold">
                          {bet.type === 'number' ? `Nummer ${bet.value}` :
                           bet.type === 'color' ? `Farbe ${bet.value === 'red' ? 'Rot' : 'Schwarz'}` :
                           bet.type === 'odd_even' ? (bet.value === 'odd' ? 'Ungerade' : 'Gerade') :
                           bet.type === 'high_low' ? (bet.value === 'low' ? '1-18' : '19-36') : bet.value}
                        </div>
                        <div className="text-sm text-gray-400">
                          {bet.odds + 1}:1 Auszahlung
                        </div>
                      </div>
                      <div className="text-casino-gold font-bold">
                        €{bet.amount}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Gesamt:</span>
                    <span className="text-casino-gold">€{totalBetAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Controls */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <div className="space-y-4">
                {gameState.result === null ? (
                  <>
                    <button
                      onClick={spin}
                      disabled={gameState.isSpinning || bets.length === 0}
                      className="casino-button w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {gameState.isSpinning ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                          Roulette dreht...
                        </div>
                      ) : (
                        <>
                          <Play className="w-5 h-5 inline mr-2" />
                          Drehen ({totalBetAmount > 0 ? `€${totalBetAmount.toFixed(2)}` : '€0.00'})
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={clearBets}
                      disabled={gameState.isSpinning || bets.length === 0}
                      className="casino-button bg-casino-red hover:bg-red-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Einsätze löschen
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startNewGame}
                    className="casino-button w-full text-lg py-4"
                  >
                    <RotateCcw className="w-5 h-5 inline mr-2" />
                    Neues Spiel
                  </button>
                )}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-casino-dark rounded-xl border border-casino-gold p-6">
              <h3 className="text-lg font-semibold text-casino-gold mb-4">Roulette Regeln</h3>
              <div className="text-gray-300 space-y-2 text-sm">
                <p>• Setzen Sie auf Zahlen, Farben oder andere Kombinationen</p>
                <p>• Einzelzahl: 35:1 Auszahlung</p>
                <p>• Rot/Schwarz, Gerade/Ungerade: 2:1 Auszahlung</p>
                <p>• Hoch (19-36) / Niedrig (1-18): 2:1 Auszahlung</p>
                <p>• Die grüne 0 gewinnt nur bei direktem Einsatz</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
