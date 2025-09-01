import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Benutzer-Tabelle
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique(),
  email: text('email').unique(),
  password: text('password'),
  balance: real('balance').default(1000), // Startguthaben
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Spiel-Sessions
export const gameSessions = sqliteTable('game_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  gameType: text('game_type').notNull(), // 'blackjack', 'roulette', 'slots'
  betAmount: real('bet_amount').notNull(),
  winAmount: real('win_amount').default(0),
  gameData: text('game_data'), // JSON für spielspezifische Daten
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Blackjack-Spiele
export const blackjackGames = sqliteTable('blackjack_games', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => gameSessions.id),
  playerHand: text('player_hand').notNull(), // JSON Array
  dealerHand: text('dealer_hand').notNull(), // JSON Array
  gameState: text('game_state').notNull(), // 'playing', 'player_won', 'dealer_won', 'draw'
  playerScore: integer('player_score'),
  dealerScore: integer('dealer_score'),
});

// Roulette-Spiele
export const rouletteGames = sqliteTable('roulette_games', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => gameSessions.id),
  betType: text('bet_type').notNull(), // 'number', 'color', 'odd_even', etc.
  betValue: text('bet_value').notNull(), // '17', 'red', 'odd', etc.
  winningNumber: integer('winning_number'),
  winningColor: text('winning_color'),
});

// Spielautomaten-Spiele
export const slotGames = sqliteTable('slot_games', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => gameSessions.id),
  reels: text('reels').notNull(), // JSON Array der Rollen
  paylines: text('paylines'), // JSON Array der Gewinnlinien
  multiplier: real('multiplier').default(1),
});

// Beziehungen
export const usersRelations = relations(users, ({ many }) => ({
  gameSessions: many(gameSessions),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  blackjackGame: one(blackjackGames),
  rouletteGame: one(rouletteGames),
  slotGame: one(slotGames),
}));
