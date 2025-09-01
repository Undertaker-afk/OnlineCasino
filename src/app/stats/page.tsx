'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/components/Providers';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Calendar,
  BarChart3,
  PieChart,
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
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  winRate: number;
  favoriteGame: string;
  biggestWin: number;
  biggestLoss: number;
}

interface GameSession {
  id: string;
  gameType: 'blackjack' | 'roulette' | 'slots';
  betAmount: number;
  winAmount: number;
  result: 'win' | 'lose' | 'push';
  date: Date;
  profit: number;
}

interface DailyStats {
  date: string;
  profit: number;
  gamesPlayed: number;
}

export default function StatsPage() {
  const { state } = useApp();
  
  // Echte Statistiken aus localStorage laden
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
    winRate: 0,
    favoriteGame: 'blackjack',
    biggestWin: 0,
    biggestLoss: 0
  });

  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  // Statistiken beim Laden der Komponente berechnen
  useEffect(() => {
    const calculateStats = () => {
      try {
        // Spielsessions aus localStorage laden
        const savedSessions = localStorage.getItem('casino_game_sessions');
        const sessions: GameSession[] = savedSessions ? JSON.parse(savedSessions) : [];
        
        if (sessions.length === 0) {
          // Keine Spiele gespielt
          setRecentSessions([]);
          setDailyStats([]);
          return;
        }

        // Grundstatistiken berechnen
        const totalGames = sessions.length;
        const totalWins = sessions.filter(s => s.result === 'win').length;
        const totalLosses = sessions.filter(s => s.result === 'lose').length;
        const totalWagered = sessions.reduce((sum, s) => sum + s.betAmount, 0);
        const totalWon = sessions.reduce((sum, s) => sum + s.winAmount, 0);
        const netProfit = totalWon - totalWagered;
        const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

        // Lieblingsspiel finden
        const gameTypeCounts = sessions.reduce((acc, session) => {
          acc[session.gameType] = (acc[session.gameType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const favoriteGame = Object.entries(gameTypeCounts).reduce((a, b) => 
          gameTypeCounts[a[0]] > gameTypeCounts[b[0]] ? a : b
        )[0] || 'blackjack';

        // Größter Gewinn und Verlust
        const profits = sessions.map(s => s.profit);
        const biggestWin = Math.max(...profits, 0);
        const biggestLoss = Math.min(...profits, 0);

        setGameStats({
          totalGames,
          totalWins,
          totalLosses,
          totalWagered,
          totalWon,
          netProfit,
          winRate,
          favoriteGame,
          biggestWin,
          biggestLoss
        });

        // Neueste Sessions (letzte 10)
        const recentSessions = sessions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
          .map(session => ({
            ...session,
            date: new Date(session.date)
          }));
        
        setRecentSessions(recentSessions);

        // Tägliche Statistiken für die letzten 7 Tage berechnen
        const today = new Date();
        const weeklyStats: DailyStats[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
          
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const daySessions = sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= dayStart && sessionDate <= dayEnd;
          });
          
          const dayProfit = daySessions.reduce((sum, session) => sum + session.profit, 0);
          const gamesPlayed = daySessions.length;
          
          weeklyStats.push({
            date: dayName,
            profit: dayProfit,
            gamesPlayed
          });
        }
        
        setDailyStats(weeklyStats);
        
      } catch (error) {
        console.error('Fehler beim Berechnen der Statistiken:', error);
        // Fallback zu leeren Daten
        setGameStats({
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          totalWagered: 0,
          totalWon: 0,
          netProfit: 0,
          winRate: 0,
          favoriteGame: 'blackjack',
          biggestWin: 0,
          biggestLoss: 0
        });
        setRecentSessions([]);
        setDailyStats([]);
      }
    };

    calculateStats();
    
    // Event Listener für Storage-Änderungen
    const handleStorageChange = () => {
      calculateStats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.user]);

  const gameTypeNames = {
    blackjack: 'Blackjack',
    roulette: 'Roulette',
    slots: 'Spielautomaten'
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `vor ${diffMins} Min`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `vor ${hours}h`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `vor ${days}d`;
    }
  };

  const maxProfit = Math.max(...dailyStats.map(d => d.profit));
  const minProfit = Math.min(...dailyStats.map(d => d.profit));
  const range = maxProfit - minProfit;

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
                Aktuelles Guthaben: €{state.gameState.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-casino-gold mb-2">Spielstatistiken</h1>
          <p className="text-gray-300 mb-8">
            {state.user?.username || 'Anonym'} - Detaillierte Übersicht Ihrer Casino-Aktivitäten
          </p>
        </motion.div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center"
          >
            <div className={`text-3xl font-bold mb-2 ${gameStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gameStats.netProfit >= 0 ? '+' : ''}€{gameStats.netProfit.toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm flex items-center justify-center">
              {gameStats.netProfit >= 0 ? 
                <TrendingUp className="w-4 h-4 mr-1 text-green-400" /> : 
                <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
              }
              Gesamtgewinn
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center"
          >
            <div className="text-3xl font-bold text-casino-gold mb-2">
              {gameStats.winRate}%
            </div>
            <div className="text-gray-400 text-sm flex items-center justify-center">
              <Percent className="w-4 h-4 mr-1" />
              Gewinnrate
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center"
          >
            <div className="text-3xl font-bold text-white mb-2">
              {gameStats.totalGames}
            </div>
            <div className="text-gray-400 text-sm flex items-center justify-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              Spiele gespielt
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center"
          >
            <div className="text-3xl font-bold text-green-400 mb-2">
              €{gameStats.biggestWin.toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm flex items-center justify-center">
              <Trophy className="w-4 h-4 mr-1" />
              Größter Gewinn
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Wöchentliche Profit/Loss Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-casino-dark rounded-xl border border-casino-gold p-6"
          >
            <h3 className="text-xl font-semibold text-casino-gold mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Wöchentliche Entwicklung
            </h3>
            
            <div className="space-y-4">
              {dailyStats.map((day, index) => {
                const height = range > 0 ? Math.abs(day.profit / range * 100) : 50;
                const isPositive = day.profit >= 0;
                
                return (
                  <div key={day.date} className="flex items-center space-x-4">
                    <div className="w-8 text-sm font-semibold text-gray-300">
                      {day.date}
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="relative flex-1 h-8 bg-casino-darker rounded border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${height}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                          className={`h-full rounded ${
                            isPositive ? 'bg-green-500' : 'bg-red-500'
                          } flex items-center justify-end pr-2`}
                        >
                          <span className="text-xs font-semibold text-white">
                            {isPositive ? '+' : ''}€{day.profit.toFixed(0)}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="w-16 text-xs text-gray-400 text-right">
                      {day.gamesPlayed} Spiele
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Game Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-casino-dark rounded-xl border border-casino-gold p-6"
          >
            <h3 className="text-xl font-semibold text-casino-gold mb-6 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Spiele Verteilung
            </h3>
            
            <div className="space-y-4">
              {[
                { game: 'blackjack', count: 124, color: 'bg-red-500' },
                { game: 'roulette', count: 78, color: 'bg-casino-gold' },
                { game: 'slots', count: 45, color: 'bg-green-500' }
              ].map((item, index) => {
                const percentage = (item.count / gameStats.totalGames * 100);
                
                return (
                  <div key={item.game} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{gameTypeNames[item.game as keyof typeof gameTypeNames]}</span>
                      <span className="text-casino-gold font-semibold">{item.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-casino-darker rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                        className={`h-3 rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-casino-dark rounded-xl border border-casino-gold p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-casino-gold mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Letzte Spiele
          </h3>

          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-casino-darker rounded-lg border border-gray-700 hover:border-casino-gold transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    session.result === 'win' ? 'bg-green-500' : 
                    session.result === 'lose' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="text-white font-semibold">
                      {gameTypeNames[session.gameType]}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatTime(session.date)} • Einsatz: €{session.betAmount}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${
                    session.profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {session.profit >= 0 ? '+' : ''}€{session.profit.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {session.result === 'win' ? 'Gewonnen' : 
                     session.result === 'lose' ? 'Verloren' : 'Unentschieden'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center">
            <Coins className="w-8 h-8 text-casino-gold mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              €{gameStats.totalWagered.toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm">Insgesamt gesetzt</div>
          </div>

          <div className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {gameStats.totalWins}
            </div>
            <div className="text-gray-400 text-sm">Siege</div>
          </div>

          <div className="bg-casino-dark rounded-xl border border-casino-gold p-6 text-center">
            <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              €{Math.abs(gameStats.biggestLoss).toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm">Größter Verlust</div>
          </div>
        </motion.div>

        {/* Responsible Gaming Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 bg-casino-dark rounded-xl border border-yellow-600 p-6 text-center"
        >
          <h4 className="text-lg font-semibold text-yellow-400 mb-2">
            Verantwortungsvolles Spielen
          </h4>
          <p className="text-gray-300">
            Überwachen Sie Ihre Spielgewohnheiten regelmäßig. Setzen Sie sich Limits und 
            halten Sie diese ein. Bei Problemen wenden Sie sich an Beratungsstellen.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
