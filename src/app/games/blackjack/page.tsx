'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/components/Providers';
import { Card, BlackjackGame } from '@/types';
import { 
  createDeck, 
  calculateBlackjackScore, 
  isBlackjack, 
  generateId 
} from '@/lib/gameUtils';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Play, 
  RotateCcw,
  TrendingUp,
  TrendingDown 
} from 'lucide-react';
import Link from 'next/link';

const CARD_SUITS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
};

interface GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  gameStatus: 'betting' | 'playing' | 'dealer_turn' | 'finished';
  result: 'win' | 'lose' | 'push' | null;
  betAmount: number;
  canHit: boolean;
  canStand: boolean;
  canDoubleDown: boolean;
  gameId: string;
}

export default function BlackjackPage() {
  const { state, dispatch } = useApp();
  
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    dealerHand: [],
    gameStatus: 'betting',
    result: null,
    betAmount: 10,
    canHit: false,
    canStand: false,
    canDoubleDown: false,
    gameId: generateId()
  });

  const [showDealerCards, setShowDealerCards] = useState(false);

  // Neues Spiel starten
  const startNewGame = () => {
    const newDeck = createDeck();
    const playerCards = [newDeck.pop()!, newDeck.pop()!];
    const dealerCards = [newDeck.pop()!, newDeck.pop()!];

    setGameState({
      deck: newDeck,
      playerHand: playerCards,
      dealerHand: dealerCards,
      gameStatus: 'playing',
      result: null,
      betAmount: gameState.betAmount,
      canHit: true,
      canStand: true,
      canDoubleDown: playerCards.length === 2 && state.gameState.balance >= gameState.betAmount * 2,
      gameId: generateId()
    });

    setShowDealerCards(false);

    // Balance reduzieren
    dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance - gameState.betAmount });

    // Prüfe auf Blackjack
    if (isBlackjack(playerCards)) {
      if (isBlackjack(dealerCards)) {
        // Push
        finishGame('push');
      } else {
        // Blackjack win
        finishGame('win', true);
      }
    }
  };

  // Karte ziehen
  const hit = () => {
    if (!gameState.canHit) return;

    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newPlayerHand = [...gameState.playerHand, newCard];
    const playerScore = calculateBlackjackScore(newPlayerHand);

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newPlayerHand,
      canDoubleDown: false
    }));

    if (playerScore > 21) {
      finishGame('lose');
    }
  };

  // Stehen bleiben
  const stand = () => {
    if (!gameState.canStand) return;
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'dealer_turn',
      canHit: false,
      canStand: false,
      canDoubleDown: false
    }));

    setShowDealerCards(true);
    playDealerTurn();
  };

  // Verdoppeln
  const doubleDown = () => {
    if (!gameState.canDoubleDown) return;

    // Zusätzlicher Einsatz
    dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance - gameState.betAmount });

    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newPlayerHand = [...gameState.playerHand, newCard];
    const playerScore = calculateBlackjackScore(newPlayerHand);

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newPlayerHand,
      betAmount: prev.betAmount * 2,
      gameStatus: 'dealer_turn',
      canHit: false,
      canStand: false,
      canDoubleDown: false
    }));

    setShowDealerCards(true);

    if (playerScore > 21) {
      finishGame('lose');
    } else {
      setTimeout(() => playDealerTurn(), 1000);
    }
  };

  // Dealer Zug
  const playDealerTurn = () => {
    let currentDeck = [...gameState.deck];
    let dealerCards = [...gameState.dealerHand];

    const dealerTurn = () => {
      let dealerScore = calculateBlackjackScore(dealerCards);
      
      if (dealerScore < 17) {
        setTimeout(() => {
          const newCard = currentDeck.pop()!;
          dealerCards.push(newCard);
          setGameState(prev => ({
            ...prev,
            dealerHand: [...dealerCards],
            deck: [...currentDeck]
          }));
          dealerTurn();
        }, 1000);
      } else {
        // Spiel beenden
        setTimeout(() => {
          const playerScore = calculateBlackjackScore(gameState.playerHand);
          const finalDealerScore = calculateBlackjackScore(dealerCards);
          
          let result: 'win' | 'lose' | 'push';
          if (finalDealerScore > 21 || playerScore > finalDealerScore) {
            result = 'win';
          } else if (playerScore < finalDealerScore) {
            result = 'lose';
          } else {
            result = 'push';
          }
          
          finishGame(result);
        }, 1000);
      }
    };

    dealerTurn();
  };

  // Spiel beenden
  const finishGame = (result: 'win' | 'lose' | 'push', blackjack = false) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      result,
      canHit: false,
      canStand: false,
      canDoubleDown: false
    }));

    // Gewinn berechnen
    let winAmount = 0;
    if (result === 'win') {
      winAmount = blackjack ? gameState.betAmount * 2.5 : gameState.betAmount * 2;
    } else if (result === 'push') {
      winAmount = gameState.betAmount;
    }

    if (winAmount > 0) {
      dispatch({ type: 'UPDATE_BALANCE', payload: state.gameState.balance + winAmount });
    }

    setShowDealerCards(true);
  };

  const playerScore = calculateBlackjackScore(gameState.playerHand);
  const dealerScore = calculateBlackjackScore(gameState.dealerHand);

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

        {/* Game Table */}
        <div className="game-table">
          {/* Dealer Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Dealer</h2>
              <div className="text-casino-gold font-semibold">
                {showDealerCards ? `Score: ${dealerScore}` : 'Score: ?'}
              </div>
            </div>
            
            <div className="flex space-x-2 justify-center">
              <AnimatePresence>
                {gameState.dealerHand.map((card, index) => (
                  <motion.div
                    key={`dealer-${index}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`casino-card w-20 h-28 flex flex-col justify-between ${
                      index === 1 && !showDealerCards ? 'bg-casino-red' : ''
                    }`}
                  >
                    {index === 1 && !showDealerCards ? (
                      <div className="flex items-center justify-center h-full text-white font-bold">
                        ?
                      </div>
                    ) : (
                      <>
                        <div className={`text-left ${SUIT_COLORS[card.suit]}`}>
                          <div className="font-bold">{card.rank}</div>
                          <div className="text-xl">{CARD_SUITS[card.suit]}</div>
                        </div>
                        <div className={`text-center text-3xl ${SUIT_COLORS[card.suit]}`}>
                          {CARD_SUITS[card.suit]}
                        </div>
                        <div className={`text-right transform rotate-180 ${SUIT_COLORS[card.suit]}`}>
                          <div className="font-bold">{card.rank}</div>
                          <div className="text-xl">{CARD_SUITS[card.suit]}</div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Game Status */}
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              {gameState.result && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-lg ${
                    gameState.result === 'win' 
                      ? 'bg-green-600 text-white' 
                      : gameState.result === 'lose'
                      ? 'bg-red-600 text-white'
                      : 'bg-yellow-600 text-black'
                  }`}
                >
                  {gameState.result === 'win' && <TrendingUp className="w-5 h-5" />}
                  {gameState.result === 'lose' && <TrendingDown className="w-5 h-5" />}
                  <span>
                    {gameState.result === 'win' ? 'Gewonnen!' : 
                     gameState.result === 'lose' ? 'Verloren!' : 'Unentschieden!'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Sie</h2>
              <div className="text-casino-gold font-semibold">
                Score: {playerScore}
              </div>
            </div>
            
            <div className="flex space-x-2 justify-center">
              <AnimatePresence>
                {gameState.playerHand.map((card, index) => (
                  <motion.div
                    key={`player-${index}`}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="casino-card w-20 h-28 flex flex-col justify-between"
                  >
                    <div className={`text-left ${SUIT_COLORS[card.suit]}`}>
                      <div className="font-bold">{card.rank}</div>
                      <div className="text-xl">{CARD_SUITS[card.suit]}</div>
                    </div>
                    <div className={`text-center text-3xl ${SUIT_COLORS[card.suit]}`}>
                      {CARD_SUITS[card.suit]}
                    </div>
                    <div className={`text-right transform rotate-180 ${SUIT_COLORS[card.suit]}`}>
                      <div className="font-bold">{card.rank}</div>
                      <div className="text-xl">{CARD_SUITS[card.suit]}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Betting Section */}
          {gameState.gameStatus === 'betting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h3 className="text-xl font-semibold text-white">Setzen Sie Ihren Einsatz</h3>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    betAmount: Math.max(1, prev.betAmount - 5)
                  }))}
                  className="casino-button bg-casino-red hover:bg-red-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <div className="bg-casino-dark px-6 py-3 rounded-lg border-2 border-casino-gold">
                  <span className="text-casino-gold font-bold text-xl">
                    €{gameState.betAmount}
                  </span>
                </div>
                
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    betAmount: Math.min(state.gameState.balance, prev.betAmount + 5)
                  }))}
                  className="casino-button bg-casino-green hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={startNewGame}
                disabled={gameState.betAmount > state.gameState.balance}
                className="casino-button text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 mr-2" />
                Deal
              </button>
            </motion.div>
          )}

          {/* Game Actions */}
          {gameState.gameStatus === 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center space-x-4"
            >
              <button
                onClick={hit}
                disabled={!gameState.canHit}
                className="casino-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Karte
              </button>
              
              <button
                onClick={stand}
                disabled={!gameState.canStand}
                className="casino-button bg-casino-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stehen
              </button>
              
              {gameState.canDoubleDown && (
                <button
                  onClick={doubleDown}
                  disabled={state.gameState.balance < gameState.betAmount}
                  className="casino-button bg-casino-green hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verdoppeln
                </button>
              )}
            </motion.div>
          )}

          {/* New Game Button */}
          {gameState.gameStatus === 'finished' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={() => setGameState(prev => ({
                  ...prev,
                  gameStatus: 'betting',
                  playerHand: [],
                  dealerHand: [],
                  result: null,
                  deck: []
                }))}
                className="casino-button text-lg px-8 py-4"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Neues Spiel
              </button>
            </motion.div>
          )}
        </div>

        {/* Game Info */}
        <div className="mt-8 bg-casino-dark rounded-lg border border-casino-gold p-6">
          <h3 className="text-lg font-semibold text-casino-gold mb-4">Blackjack Regeln</h3>
          <div className="text-gray-300 space-y-2">
            <p>• Ziel: Kommen Sie so nah wie möglich an 21, ohne zu überziehen</p>
            <p>• Ass = 1 oder 11, Bildkarten = 10, andere Karten = Nennwert</p>
            <p>• Blackjack (21 mit 2 Karten) zahlt 3:2</p>
            <p>• Verdoppeln: Einsatz verdoppeln und genau eine Karte erhalten</p>
            <p>• Dealer muss bei 17 stehen bleiben</p>
          </div>
        </div>
      </div>
    </div>
  );
}
