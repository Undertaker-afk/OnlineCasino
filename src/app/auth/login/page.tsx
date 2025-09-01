'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/Providers';
import { 
  Crown, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  ArrowLeft,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Hier würde normalerweise die API-Anfrage erfolgen
      // Für Demo-Zwecke simulieren wir einen Login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliere API-Call

      // Mock-Benutzer für Demo
      const mockUser = {
        id: 'user_123',
        username: formData.email.split('@')[0],
        email: formData.email,
        balance: 1000,
        isAnonymous: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'SET_USER', payload: mockUser });
      localStorage.setItem('casino_user', JSON.stringify(mockUser));
      localStorage.setItem('casino_token', 'demo_token_' + Date.now());

      router.push('/games');
    } catch (err) {
      setError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@casino.com',
      password: 'demo123'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="flex items-center text-casino-gold hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-casino-dark rounded-xl border-2 border-casino-gold p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Crown className="w-16 h-16 text-casino-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-casino-gold mb-2">
              Willkommen zurück!
            </h1>
            <p className="text-gray-300">
              Melden Sie sich an, um weiterzuspielen
            </p>
          </div>

          {/* Demo Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoLogin}
            className="w-full bg-casino-green hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors"
          >
            <User className="w-5 h-5 inline mr-2" />
            Demo-Login verwenden
          </motion.button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-casino-dark text-gray-400">oder</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-600 text-white p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-casino-darker border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-casino-gold focus:outline-none transition-colors"
                  placeholder="ihre.email@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-casino-darker border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-casino-gold focus:outline-none transition-colors"
                  placeholder="Ihr Passwort"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-600 text-casino-gold focus:ring-casino-gold focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-300">Angemeldet bleiben</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-casino-gold hover:text-yellow-400 transition-colors"
              >
                Passwort vergessen?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full casino-button text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Anmeldung läuft...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 inline mr-2" />
                  Anmelden
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Noch kein Konto?{' '}
              <Link 
                href="/auth/register" 
                className="text-casino-gold hover:text-yellow-400 font-semibold transition-colors"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>

          {/* Anonymous Play Option */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <Link
              href="/games?mode=anonymous"
              className="block text-center text-gray-400 hover:text-casino-gold transition-colors"
            >
              Oder spielen Sie anonym ohne Registrierung
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
