'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { Heart, Target, Coins, Crown, Play } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GamesPage() {
  const { state, loginAnonymous } = useApp();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Automatisch anonymer Login wenn mode=anonymous
    if (searchParams.get('mode') === 'anonymous' && !state.isAuthenticated) {
      loginAnonymous();
    }
  }, [searchParams, state.isAuthenticated, loginAnonymous]);

  const games = [
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Schlagen Sie den Dealer mit der perfekten 21. Strategie trifft auf Glück.',
      icon: Heart,
      color: 'text-casino-red',
      bgColor: 'bg-casino-red',
      minBet: 5,
      maxBet: 500,
      rtp: '99.5%'
    },
    {
      id: 'roulette',
      name: 'Roulette',
      description: 'Setzen Sie auf Ihr Glück! Rot, Schwarz oder Ihre Lieblingszahl.',
      icon: Target,
      color: 'text-casino-gold',
      bgColor: 'bg-casino-gold',
      minBet: 1,
      maxBet: 1000,
      rtp: '97.3%'
    },
    {
      id: 'slots',
      name: 'Spielautomaten',
      description: 'Drehen Sie die Walzen für den großen Jackpot. Einfach und spannend.',
      icon: Coins,
      color: 'text-casino-green',
      bgColor: 'bg-casino-green',
      minBet: 0.1,
      maxBet: 100,
      rtp: '96.8%'
    }
  ];

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <Crown className="w-16 h-16 text-casino-gold mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-casino-gold">
            Willkommen im Royal Casino
          </h1>
          <p className="text-gray-300 mb-8">
            Um zu spielen, melden Sie sich an oder spielen Sie anonym.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={loginAnonymous}
              className="casino-button w-full"
            >
              <Play className="w-5 h-5 inline mr-2" />
              Anonym spielen
            </button>
            <Link href="/auth/login" className="casino-button bg-casino-red hover:bg-red-700 w-full text-center">
              Anmelden
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 text-casino-gold">
            Casino Spiele
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Wählen Sie Ihr Lieblingsspiel und beginnen Sie zu gewinnen!
          </p>
          
          {/* Balance Display */}
          <div className="inline-flex items-center space-x-2 bg-casino-dark px-6 py-3 rounded-lg border border-casino-gold">
            <Coins className="h-6 w-6 text-casino-gold" />
            <span className="text-2xl font-bold text-casino-gold">
              €{state.gameState.balance.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-casino-dark rounded-xl border-2 border-casino-gold overflow-hidden hover:scale-105 transition-all duration-300 group"
            >
              {/* Game Header */}
              <div className={`${game.bgColor} p-6 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black opacity-20" />
                <game.icon className="w-16 h-16 mx-auto mb-4 text-white relative z-10" />
                <h2 className="text-2xl font-bold text-white relative z-10">{game.name}</h2>
              </div>

              {/* Game Info */}
              <div className="p-6">
                <p className="text-gray-300 mb-6 text-center">
                  {game.description}
                </p>

                {/* Game Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <div className="text-casino-gold font-semibold">Min. Einsatz</div>
                    <div className="text-white">€{game.minBet}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-casino-gold font-semibold">Max. Einsatz</div>
                    <div className="text-white">€{game.maxBet}</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="text-casino-gold font-semibold">RTP (Return to Player)</div>
                    <div className="text-white">{game.rtp}</div>
                  </div>
                </div>

                {/* Play Button */}
                <Link 
                  href={`/games/${game.id}`}
                  className="casino-button w-full text-center group-hover:scale-105 transition-transform"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Spielen
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-casino-dark rounded-xl border border-casino-gold p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-casino-gold mb-4">
            Verantwortungsvolles Spielen
          </h3>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Spielen Sie nur mit Geld, das Sie sich leisten können zu verlieren. 
            Setzen Sie sich Limits und halten Sie diese ein. Glücksspiel sollte 
            Unterhaltung sein, keine Möglichkeit, Geld zu verdienen.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
