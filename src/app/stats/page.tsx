'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/components/Providers';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  BarChart3,
  Target,
  Trophy,
  Clock,
  Percent
} from 'lucide-react';
import Link from 'next/link';

interface GameStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalPushes: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  winRate: number;
  favoriteGame: string | null;
  biggestWin: number;
  biggestLoss: number;
  averageBet: number;
  averageWin: number;
  sessionsToday: number;
  profitToday: number;
}

interface StoredGameSession {
  id: string;
  gameType: 'blackjack' | 'roulette' | 'slots';
  betAmount: number;
  winAmount: number;
  result: 'win' | 'lose' | 'push';
  date: string;
  profit: number;
  userId?: string;
}

interface DailyStats {
  date: string;
  profit: number;
  gamesPlayed: number;
}

export default function StatsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
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
  });
  
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [recentSessions, setRecentSessions] = useState<StoredGameSession[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Echte Daten aus localStorage laden
      try {
        const savedSessions = localStorage.getItem('casino_game_sessions');
        const sessions: StoredGameSession[] = savedSessions ? JSON.parse(savedSessions) : [];
        
        // Statistiken berechnen
        const stats = calculateStats(sessions);
        const daily = calculateDailyStats(sessions);
        const recent = sessions.slice(-10).reverse(); // Letzte 10 Spiele
        
        setGameStats(stats);
        setDailyStats(daily);
        setRecentSessions(recent);
      } catch (error) {
        console.error('Fehler beim Laden der Spielstatistiken:', error);
      }
    }
  }, [mounted]);

  const calculateStats = (sessions: StoredGameSession[]): GameStats => {
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
    const winRate = (totalWins / totalGames) * 100;

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

    // Sessions heute
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
  };

  const calculateDailyStats = (sessions: StoredGameSession[]): DailyStats[] => {
    const result: DailyStats[] = [];
    
    // Letzte 7 Tage
    for (let i = 6; i >= 0; i--) {
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

      result.push({
        date: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        profit,
        gamesPlayed
      });
    }

    return result;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatGameType = (gameType: string) => {
    const gameNames = {
      'blackjack': 'Blackjack',
      'roulette': 'Roulette',
      'slots': 'Spielautomaten'
    };
    return gameNames[gameType as keyof typeof gameNames] || gameType;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-casino-dark flex items-center justify-center">
        <div className="text-casino-gold">Lade Statistiken...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/games" className="flex items-center text-casino-gold hover:text-yellow-400">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück zu Spielen
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-casino-dark px-4 py-2 rounded-lg border border-casino-gold">
              <span className="text-casino-gold font-semibold">
                Guthaben: {formatCurrency(state.user.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-casino-gold mb-2">Spielstatistiken</h1>
          <p className="text-gray-300 mb-8">
            Verfolgen Sie Ihre Casino-Performance und analysieren Sie Ihre Spielmuster
          </p>
        </motion.div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-casino-gold" />
              <span className="text-2xl font-bold text-white">{gameStats.totalGames}</span>
            </div>
            <p className="text-gray-300 text-sm">Spiele gespielt</p>
            <p className="text-xs text-gray-400 mt-1">Heute: {gameStats.sessionsToday}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-white">{gameStats.winRate.toFixed(1)}%</span>
            </div>
            <p className="text-gray-300 text-sm">Gewinnrate</p>
            <p className="text-xs text-gray-400 mt-1">
              {gameStats.totalWins} Siege, {gameStats.totalLosses} Niederlagen
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              {gameStats.netProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
              <span className={`text-2xl font-bold ${
                gameStats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatCurrency(gameStats.netProfit)}
              </span>
            </div>
            <p className="text-gray-300 text-sm">Gesamtgewinn/-verlust</p>
            <p className="text-xs text-gray-400 mt-1">
              Heute: {formatCurrency(gameStats.profitToday)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-6 h-6 text-casino-gold" />
              <span className="text-2xl font-bold text-casino-gold">
                {formatCurrency(gameStats.biggestWin)}
              </span>
            </div>
            <p className="text-gray-300 text-sm">Größter Gewinn</p>
            <p className="text-xs text-gray-400 mt-1">
              Lieblingsspiel: {gameStats.favoriteGame ? formatGameType(gameStats.favoriteGame) : 'Keine Daten'}
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Profit Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-casino-gold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Täglicher Gewinn/Verlust
              </h3>
            </div>
            
            <div className="space-y-3">
              {dailyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm w-12">{day.date}</span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-700 rounded-full h-2 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.abs(day.profit) / 100, 100)}%` }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`h-2 rounded-full ${
                          day.profit >= 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-semibold w-20 text-right ${
                    day.profit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(day.profit)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Detailed Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-casino-gold flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                Detaillierte Statistiken
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-casino-gold">
                  {formatCurrency(gameStats.totalWagered)}
                </div>
                <div className="text-xs text-gray-400">Gesamt gesetzt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(gameStats.totalWon)}
                </div>
                <div className="text-xs text-gray-400">Gesamt gewonnen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(gameStats.averageBet)}
                </div>
                <div className="text-xs text-gray-400">Ø Einsatz</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(gameStats.averageWin)}
                </div>
                <div className="text-xs text-gray-400">Ø Gewinn</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-casino-dark to-black p-6 rounded-xl border border-casino-gold/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-casino-gold flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Letzte Spiele
            </h3>
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-casino-gold/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.result === 'win' ? 'bg-green-500' : 
                      session.result === 'lose' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium text-white">
                        {formatGameType(session.gameType)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(session.date).toLocaleString('de-DE')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-gray-300 text-sm">
                      Einsatz: {formatCurrency(session.betAmount)}
                    </div>
                    <div className={`font-semibold ${
                      session.profit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {session.profit >= 0 ? '+' : ''}{formatCurrency(session.profit)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Noch keine Spiele gespielt. Besuchen Sie die{' '}
              <Link href="/games" className="text-casino-gold hover:underline">
                Spielhalle
              </Link>
              {' '}um zu beginnen!
            </div>
          )}
        </motion.div>

        {/* Performance Summary */}
        {gameStats.totalGames > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-gradient-to-r from-casino-gold/10 to-yellow-500/10 p-6 rounded-xl border border-casino-gold/30"
          >
            <h3 className="text-xl font-bold text-casino-gold mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              Performance-Zusammenfassung
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {((gameStats.totalWon / gameStats.totalWagered) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">RTP (Return to Player)</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {(gameStats.totalGames / Math.max(1, Math.ceil((Date.now() - new Date(recentSessions[recentSessions.length - 1]?.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)}
                </div>
                <div className="text-sm text-gray-300">Spiele pro Tag</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  gameStats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {gameStats.netProfit >= 0 ? 'Gewinn' : 'Verlust'}
                </div>
                <div className="text-sm text-gray-300">Gesamtergebnis</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
