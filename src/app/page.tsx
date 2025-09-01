'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Dices, Heart, Target, Crown, Coins, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-casino-dark via-casino-darker to-black opacity-90" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-casino-gold rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{
                y: [null, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <Crown className="w-20 h-20 text-casino-gold mx-auto mb-6" />
            <h1 className="text-6xl md:text-8xl font-bold mb-4 neon-glow text-casino-gold">
              ROYAL CASINO
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8">
              Das ultimative Online Casino Erlebnis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/games" className="casino-button text-xl px-8 py-4">
              <Dices className="w-6 h-6 inline mr-2" />
              Jetzt Spielen
            </Link>
            
            <Link href="/auth/register" className="casino-button bg-casino-red hover:bg-red-700 text-xl px-8 py-4">
              <Users className="w-6 h-6 inline mr-2" />
              Registrieren
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-6 text-gray-400"
          >
            Oder spielen Sie <Link href="/games?mode=anonymous" className="text-casino-gold hover:underline">anonym</Link> ohne Registrierung
          </motion.p>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-center mb-16 text-casino-gold"
          >
            Unsere Spiele
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Blackjack */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="game-table text-center hover:scale-105 transition-transform duration-300"
            >
              <Heart className="w-16 h-16 text-casino-red mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4 text-casino-gold">Blackjack</h3>
              <p className="text-gray-300 mb-6">
                Schlagen Sie den Dealer mit der perfekten 21! 
                Strategisch und spannend.
              </p>
              <Link href="/games/blackjack" className="casino-button">
                Spielen
              </Link>
            </motion.div>

            {/* Roulette */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="game-table text-center hover:scale-105 transition-transform duration-300"
            >
              <Target className="w-16 h-16 text-casino-gold mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4 text-casino-gold">Roulette</h3>
              <p className="text-gray-300 mb-6">
                Setzen Sie auf Rot oder Schwarz, Zahlen oder Kombinationen. 
                Das Glück entscheidet!
              </p>
              <Link href="/games/roulette" className="casino-button">
                Spielen
              </Link>
            </motion.div>

            {/* Spielautomaten */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="game-table text-center hover:scale-105 transition-transform duration-300"
            >
              <Coins className="w-16 h-16 text-casino-gold mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4 text-casino-gold">Spielautomaten</h3>
              <p className="text-gray-300 mb-6">
                Drehen Sie die Walzen und hoffen Sie auf den Jackpot! 
                Einfach und aufregend.
              </p>
              <Link href="/games/slots" className="casino-button">
                Spielen
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-casino-dark">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-center mb-16 text-casino-gold"
          >
            Warum Royal Casino?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Crown,
                title: "Premium Erlebnis",
                description: "Luxuriöse Grafiken und erstklassige Animationen"
              },
              {
                icon: Users,
                title: "Für Jeden",
                description: "Registriert oder anonym - Sie entscheiden"
              },
              {
                icon: Coins,
                title: "Fairer Spielspaß",
                description: "Transparente Gewinnchancen und faire Auszahlungen"
              },
              {
                icon: Heart,
                title: "Verantwortung",
                description: "Wir fördern verantwortungsvolles Spielen"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg bg-casino-darker border border-casino-gold"
              >
                <feature.icon className="w-12 h-12 text-casino-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
