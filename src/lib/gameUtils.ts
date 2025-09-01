import { Card } from '@/types';

// Karten-Deck erstellen
export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      let value = parseInt(rank);
      if (rank === 'A') value = 11;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;

      deck.push({ suit, rank, value });
    });
  });

  return shuffleDeck(deck);
}

// Deck mischen
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Blackjack Score berechnen
export function calculateBlackjackScore(hand: Card[]): number {
  let score = 0;
  let aces = 0;

  hand.forEach(card => {
    if (card.rank === 'A') {
      aces++;
      score += 11;
    } else {
      score += card.value;
    }
  });

  // Asse von 11 auf 1 reduzieren wenn nötig
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

// Blackjack prüfen
export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateBlackjackScore(hand) === 21;
}

// Roulette Nummer Eigenschaften
export function getRouletteNumberProperties(number: number) {
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  
  return {
    color: number === 0 ? 'green' : redNumbers.includes(number) ? 'red' : 'black',
    isEven: number !== 0 && number % 2 === 0,
    isOdd: number !== 0 && number % 2 === 1,
    isHigh: number >= 19 && number <= 36,
    isLow: number >= 1 && number <= 18,
    dozen: number === 0 ? 0 : Math.ceil(number / 12),
    column: number === 0 ? 0 : ((number - 1) % 3) + 1,
  };
}

// Roulette Gewinn berechnen
export function calculateRouletteWin(betType: string, betValue: string, winningNumber: number, betAmount: number): number {
  const props = getRouletteNumberProperties(winningNumber);
  
  switch (betType) {
    case 'number':
      return parseInt(betValue) === winningNumber ? betAmount * 35 : 0;
    case 'color':
      return props.color === betValue ? betAmount * 2 : 0;
    case 'odd_even':
      const isMatch = (betValue === 'odd' && props.isOdd) || (betValue === 'even' && props.isEven);
      return isMatch ? betAmount * 2 : 0;
    case 'high_low':
      const isHighLowMatch = (betValue === 'high' && props.isHigh) || (betValue === 'low' && props.isLow);
      return isHighLowMatch ? betAmount * 2 : 0;
    case 'dozen':
      return props.dozen === parseInt(betValue) ? betAmount * 3 : 0;
    case 'column':
      return props.column === parseInt(betValue) ? betAmount * 3 : 0;
    default:
      return 0;
  }
}

// Zufällige ID generieren
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
