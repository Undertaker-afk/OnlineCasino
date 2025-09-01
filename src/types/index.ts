export interface User {
  id: string;
  username?: string;
  email?: string;
  balance: number;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  userId?: string;
  gameType: 'blackjack' | 'roulette' | 'slots';
  betAmount: number;
  winAmount: number;
  gameData?: any;
  createdAt: Date;
}

// Blackjack
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

export interface BlackjackGame {
  id: string;
  sessionId: string;
  playerHand: Card[];
  dealerHand: Card[];
  gameState: 'playing' | 'player_won' | 'dealer_won' | 'draw' | 'blackjack';
  playerScore: number;
  dealerScore: number;
}

// Roulette
export interface RouletteGame {
  id: string;
  sessionId: string;
  betType: 'number' | 'color' | 'odd_even' | 'high_low' | 'dozen' | 'column';
  betValue: string;
  winningNumber: number;
  winningColor: 'red' | 'black' | 'green';
}

export interface RouletteBet {
  type: RouletteGame['betType'];
  value: string;
  amount: number;
  odds: number;
}

// Spielautomaten
export interface SlotGame {
  id: string;
  sessionId: string;
  reels: string[][];
  paylines: number[];
  multiplier: number;
}

export interface SlotSymbol {
  name: string;
  image: string;
  value: number;
  frequency: number;
}

// Allgemeine Game States
export interface GameState {
  balance: number;
  currentGame?: GameSession;
  isPlaying: boolean;
  isLoading: boolean;
}
