import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateId } from './gameUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface JWTPayload {
  userId: string;
  username?: string;
  isAnonymous: boolean;
}

// JWT Token erstellen
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// JWT Token verifizieren
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Passwort hashen
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Passwort vergleichen
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Anonymen Benutzer erstellen
export function createAnonymousUser() {
  return {
    id: generateId(),
    username: undefined,
    email: undefined,
    password: undefined,
    balance: 1000, // Startguthaben für anonyme Benutzer
    isAnonymous: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
