'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, User, LogOut, Coins, Menu, X } from 'lucide-react';
import { useApp } from './Providers';
import { useState } from 'react';

export function Navigation() {
  const { state, loginAnonymous, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-casino-darker border-b border-casino-gold sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-casino-gold" />
            <span className="text-xl font-bold text-casino-gold">
              Royal Casino
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/games" 
              className="text-white hover:text-casino-gold transition-colors"
            >
              Spiele
            </Link>
            
            {state.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Balance Display - Clickable */}
                <Link 
                  href="/stats"
                  className="flex items-center space-x-2 bg-casino-dark px-3 py-2 rounded-lg hover:bg-opacity-80 transition-all cursor-pointer group"
                >
                  <Coins className="h-4 w-4 text-casino-gold group-hover:scale-110 transition-transform" />
                  <span className="text-casino-gold font-semibold">
                    €{state.gameState.balance.toFixed(2)}
                  </span>
                </Link>

                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-white">
                    {state.user?.username || 'Anonym'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-white hover:text-casino-gold transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={loginAnonymous}
                  className="text-white hover:text-casino-gold transition-colors"
                >
                  Anonym spielen
                </button>
                
                <Link 
                  href="/auth/login"
                  className="text-white hover:text-casino-gold transition-colors"
                >
                  Anmelden
                </Link>
                
                <Link
                  href="/auth/register"
                  className="casino-button text-sm"
                >
                  Registrieren
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-casino-gold"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                href="/games"
                className="text-white hover:text-casino-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Spiele
              </Link>

              {state.isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      {state.user?.username || 'Anonym'}
                    </span>
                    <Link 
                      href="/stats"
                      className="flex items-center space-x-2 hover:bg-casino-dark px-2 py-1 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Coins className="h-4 w-4 text-casino-gold" />
                      <span className="text-casino-gold font-semibold">
                        €{state.gameState.balance.toFixed(2)}
                      </span>
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-white hover:text-casino-gold transition-colors"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      loginAnonymous();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-white hover:text-casino-gold transition-colors"
                  >
                    Anonym spielen
                  </button>
                  
                  <Link 
                    href="/auth/login"
                    className="text-white hover:text-casino-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anmelden
                  </Link>
                  
                  <Link
                    href="/auth/register"
                    className="casino-button text-sm inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
