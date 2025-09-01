'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/components/Providers';
import { Eye, EyeOff, Mail, Lock, User, Crown, ArrowLeft, Play, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

export default function RegisterPage() {
  const { dispatch, loginAnonymous } = useApp();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Passwort-Stärke berechnen
  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    let feedback = '';
    let color = 'text-red-500';

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = 'Sehr schwach';
        color = 'text-red-500';
        break;
      case 2:
        feedback = 'Schwach';
        color = 'text-red-400';
        break;
      case 3:
        feedback = 'Mittel';
        color = 'text-yellow-500';
        break;
      case 4:
        feedback = 'Stark';
        color = 'text-green-400';
        break;
      case 5:
        feedback = 'Sehr stark';
        color = 'text-green-500';
        break;
      default:
        feedback = 'Sehr schwach';
        color = 'text-red-500';
    }

    return { score, feedback, color };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validierung
    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Bitte akzeptieren Sie die Nutzungsbedingungen.');
      return;
    }

    setIsLoading(true);

    try {
      // Hier würde normalerweise die API-Anfrage für Registrierung stehen
      // Für Demo-Zwecke simulieren wir eine Registrierung
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock-User erstellen (in echter App würde das vom Server kommen)
      const user = {
        id: 'user_' + Date.now(),
        username: formData.username,
        email: formData.email,
        balance: 1000, // Willkommensbonus
        isAnonymous: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'SET_USER', payload: user });
      localStorage.setItem('casino_user', JSON.stringify(user));
      localStorage.setItem('casino_token', 'mock_jwt_token_' + Date.now());
      
      router.push('/games');
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    loginAnonymous();
    router.push('/games');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link 
          href="/" 
          className="flex items-center text-casino-gold hover:text-yellow-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Zurück zur Startseite
        </Link>

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
              Konto erstellen
            </h1>
            <p className="text-gray-300">
              Treten Sie dem Royal Casino bei und erhalten Sie €1000 Willkommensbonus
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3 text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Benutzername
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-casino-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent transition-colors"
                  placeholder="IhrBenutzername"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-casino-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent transition-colors"
                  placeholder="ihre.email@beispiel.de"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passwort
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-casino-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Passwort-Stärke:</span>
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score === 3 ? 'bg-yellow-500' :
                        passwordStrength.score === 4 ? 'bg-green-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passwort bestätigen
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-casino-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center">
                  {passwordsMatch ? (
                    <div className="flex items-center text-green-400">
                      <Check className="w-4 h-4 mr-2" />
                      <span className="text-sm">Passwörter stimmen überein</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <X className="w-4 h-4 mr-2" />
                      <span className="text-sm">Passwörter stimmen nicht überein</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                className="mt-1 h-4 w-4 text-casino-gold focus:ring-casino-gold border-gray-600 rounded bg-casino-darker"
              />
              <label className="ml-2 text-sm text-gray-300">
                Ich akzeptiere die{' '}
                <Link href="/terms" className="text-casino-gold hover:text-yellow-400 underline">
                  Nutzungsbedingungen
                </Link>
                {' '}und die{' '}
                <Link href="/privacy" className="text-casino-gold hover:text-yellow-400 underline">
                  Datenschutzerklärung
                </Link>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch || passwordStrength.score < 3}
              className="casino-button w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Konto wird erstellt...
                </div>
              ) : (
                'Konto erstellen'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">oder</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Anonymous Login */}
          <button
            onClick={handleAnonymousLogin}
            disabled={isLoading}
            className="casino-button bg-casino-green hover:bg-green-700 w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 inline mr-2" />
            Anonym spielen
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Bereits ein Konto?{' '}
              <Link href="/auth/login" className="text-casino-gold hover:text-yellow-400 font-semibold transition-colors">
                Hier anmelden
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Welcome Bonus Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 bg-casino-dark rounded-lg border border-casino-gold p-4 text-center"
        >
          <h3 className="text-casino-gold font-semibold mb-2">🎁 Willkommensbonus</h3>
          <p className="text-gray-300 text-sm">
            Erhalten Sie €1000 Startguthaben bei der Registrierung - keine Einzahlung erforderlich!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
