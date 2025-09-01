// Game session tracking utilities

export interface GameSessionData {
  id: string;
  gameType: 'blackjack' | 'roulette' | 'slots';
  betAmount: number;
  winAmount: number;
  result: 'win' | 'lose' | 'push';
  date: Date;
  profit: number;
}

// Spielsitzung speichern
export function saveGameSession(sessionData: Omit<GameSessionData, 'id' | 'date'>) {
  try {
    const session: GameSessionData = {
      ...sessionData,
      id: generateSessionId(),
      date: new Date(),
      profit: sessionData.winAmount - sessionData.betAmount
    };

    // Bestehende Sessions laden
    const existingSessions = getGameSessions();
    
    // Neue Session hinzufügen
    const updatedSessions = [session, ...existingSessions];
    
    // Nur die letzten 1000 Sessions behalten (Performance)
    const sessionsToKeep = updatedSessions.slice(0, 1000);
    
    // In localStorage speichern
    localStorage.setItem('casino_game_sessions', JSON.stringify(sessionsToKeep));
    
    return session;
  } catch (error) {
    console.error('Fehler beim Speichern der Spielsitzung:', error);
    return null;
  }
}

// Alle Spielsitzungen laden
export function getGameSessions(): GameSessionData[] {
  try {
    const saved = localStorage.getItem('casino_game_sessions');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Fehler beim Laden der Spielsitzungen:', error);
    return [];
  }
}

// Spielsitzungen für einen bestimmten Zeitraum laden
export function getGameSessionsInDateRange(startDate: Date, endDate: Date): GameSessionData[] {
  const allSessions = getGameSessions();
  
  return allSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}

// Statistiken für einen bestimmten Spieltyp berechnen
export function getGameTypeStats(gameType: 'blackjack' | 'roulette' | 'slots') {
  const sessions = getGameSessions().filter(s => s.gameType === gameType);
  
  if (sessions.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      totalWagered: 0,
      totalWon: 0,
      netProfit: 0
    };
  }

  const totalGames = sessions.length;
  const totalWins = sessions.filter(s => s.result === 'win').length;
  const totalLosses = sessions.filter(s => s.result === 'lose').length;
  const winRate = (totalWins / totalGames) * 100;
  const totalWagered = sessions.reduce((sum, s) => sum + s.betAmount, 0);
  const totalWon = sessions.reduce((sum, s) => sum + s.winAmount, 0);
  const netProfit = totalWon - totalWagered;

  return {
    totalGames,
    totalWins,
    totalLosses,
    winRate,
    totalWagered,
    totalWon,
    netProfit
  };
}

// Session ID generieren
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
}

// Alle Spielsitzungen löschen (für Reset)
export function clearAllGameSessions() {
  try {
    localStorage.removeItem('casino_game_sessions');
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen der Spielsitzungen:', error);
    return false;
  }
}

// Tägliche Gewinne/Verluste der letzten N Tage berechnen
export function getDailyProfitStats(days: number = 7) {
  const today = new Date();
  const stats = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySessions = getGameSessionsInDateRange(dayStart, dayEnd);
    const dayProfit = daySessions.reduce((sum, session) => sum + session.profit, 0);
    
    stats.push({
      date: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      fullDate: date,
      profit: dayProfit,
      gamesPlayed: daySessions.length
    });
  }

  return stats;
}
