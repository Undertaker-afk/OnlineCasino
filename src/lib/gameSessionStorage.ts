// Game Session Management für localStorage

export interface StoredGameSession {
  id: string;
  gameType: 'blackjack' | 'roulette' | 'slots';
  betAmount: number;
  winAmount: number;
  result: 'win' | 'lose' | 'push';
  date: string; // ISO String
  profit: number;
  userId?: string;
}

// Spielsession speichern
export function saveGameSession(session: Omit<StoredGameSession, 'id' | 'date'>) {
  try {
    const existingSessions = getGameSessions();
    const newSession: StoredGameSession = {
      ...session,
      id: generateSessionId(),
      date: new Date().toISOString()
    };

    const updatedSessions = [...existingSessions, newSession];
    
    // Nur die letzten 1000 Sessions behalten
    if (updatedSessions.length > 1000) {
      updatedSessions.splice(0, updatedSessions.length - 1000);
    }

    localStorage.setItem('casino_game_sessions', JSON.stringify(updatedSessions));
    return newSession;
  } catch (error) {
    console.error('Fehler beim Speichern der Spielsession:', error);
    return null;
  }
}

// Alle Spielsessions laden
export function getGameSessions(): StoredGameSession[] {
  try {
    const savedSessions = localStorage.getItem('casino_game_sessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  } catch (error) {
    console.error('Fehler beim Laden der Spielsessions:', error);
    return [];
  }
}

// Letzte N Spielsessions laden
export function getRecentGameSessions(limit: number = 10): StoredGameSession[] {
  const sessions = getGameSessions();
  return sessions.slice(-limit).reverse(); // Neueste zuerst
}

// Spielsessions für einen bestimmten Benutzer laden
export function getUserGameSessions(userId: string): StoredGameSession[] {
  const sessions = getGameSessions();
  return sessions.filter(session => session.userId === userId);
}

// Spielsessions nach Spieltyp filtern
export function getGameSessionsByType(gameType: string): StoredGameSession[] {
  const sessions = getGameSessions();
  return sessions.filter(session => session.gameType === gameType);
}

// Alle Spielsessions löschen
export function clearGameSessions() {
  try {
    localStorage.removeItem('casino_game_sessions');
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen der Spielsessions:', error);
    return false;
  }
}

// Session ID generieren
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
}

// Statistiken berechnen
export function calculateUserStats(sessions: StoredGameSession[]) {
  if (sessions.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      totalWagered: 0,
      totalWon: 0,
      netProfit: 0,
      winRate: 0,
      favoriteGame: null,
      biggestWin: 0,
      biggestLoss: 0,
      averageBet: 0,
      averageWin: 0,
      sessionsToday: 0,
      profitToday: 0
    };
  }

  const totalGames = sessions.length;
  const totalWins = sessions.filter(s => s.result === 'win').length;
  const totalLosses = sessions.filter(s => s.result === 'lose').length;
  const totalPushes = sessions.filter(s => s.result === 'push').length;
  const totalWagered = sessions.reduce((sum, s) => sum + s.betAmount, 0);
  const totalWon = sessions.reduce((sum, s) => sum + s.winAmount, 0);
  const netProfit = sessions.reduce((sum, s) => sum + s.profit, 0);
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  // Beliebtestes Spiel
  const gameTypeCounts = sessions.reduce((counts, session) => {
    counts[session.gameType] = (counts[session.gameType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const favoriteGame = Object.keys(gameTypeCounts).length > 0 
    ? Object.entries(gameTypeCounts).reduce((a, b) => 
        gameTypeCounts[a[0]] > gameTypeCounts[b[0]] ? a : b
      )[0] 
    : null;

  const biggestWin = Math.max(...sessions.map(s => s.profit), 0);
  const biggestLoss = Math.min(...sessions.map(s => s.profit), 0);
  const averageBet = totalWagered / totalGames;
  const averageWin = totalWins > 0 ? totalWon / totalWins : 0;

  // Sessions und Profit heute
  const today = new Date().toDateString();
  const sessionsToday = sessions.filter(s => 
    new Date(s.date).toDateString() === today
  ).length;
  const profitToday = sessions
    .filter(s => new Date(s.date).toDateString() === today)
    .reduce((sum, s) => sum + s.profit, 0);

  return {
    totalGames,
    totalWins,
    totalLosses,
    totalPushes,
    totalWagered,
    totalWon,
    netProfit,
    winRate,
    favoriteGame,
    biggestWin,
    biggestLoss,
    averageBet,
    averageWin,
    sessionsToday,
    profitToday
  };
}

// Tägliche Statistiken für die letzten 7 Tage
export function getDailyStats(sessions: StoredGameSession[], days: number = 7) {
  const result: Array<{
    date: string;
    fullDate: string;
    profit: number;
    gamesPlayed: number;
    wagered: number;
    won: number;
  }> = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    const profit = daySessions.reduce((sum, session) => sum + session.profit, 0);
    const gamesPlayed = daySessions.length;
    const wagered = daySessions.reduce((sum, session) => sum + session.betAmount, 0);
    const won = daySessions.reduce((sum, session) => sum + session.winAmount, 0);

    result.push({
      date: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      fullDate: date.toISOString().split('T')[0],
      profit,
      gamesPlayed,
      wagered,
      won
    });
  }

  return result;
}

// Game-spezifische Statistiken
export function getGameTypeStats(sessions: StoredGameSession[]) {
  const gameTypes = ['blackjack', 'roulette', 'slots'] as const;
  
  return gameTypes.map(gameType => {
    const gameSessions = sessions.filter(s => s.gameType === gameType);
    const stats = calculateUserStats(gameSessions);
    
    return {
      gameType,
      ...stats
    };
  });
}
