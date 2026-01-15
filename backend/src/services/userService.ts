import { v4 as uuidv4 } from 'uuid';
import { User, findUserByEmail, findUserById, saveUser, readUsers } from '../utils/storage';

const INITIAL_CREDITS = 5000;

/**
 * Create a new user with email
 * Returns existing user if email already exists
 */
export function createUser(email: string): User {
  // Check if user already exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    // Update last login
    existingUser.lastLogin = new Date().toISOString();
    saveUser(existingUser);
    return existingUser;
  }

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    credits: INITIAL_CREDITS,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  saveUser(newUser);
  return newUser;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | undefined {
  return findUserByEmail(email);
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | undefined {
  return findUserById(id);
}

/**
 * Update user credits (add or subtract)
 */
export function updateUserCredits(userId: string, amount: number): User | null {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  user.credits = Math.max(0, user.credits + amount);
  saveUser(user);
  return user;
}

/**
 * Deduct credits from user
 * Returns true if deduction was successful, false if insufficient credits
 */
export function deductCredits(userId: string, amount: number): { success: boolean; user: User | null } {
  const user = findUserById(userId);
  if (!user) {
    return { success: false, user: null };
  }

  if (user.credits < amount) {
    return { success: false, user };
  }

  user.credits -= amount;
  saveUser(user);
  return { success: true, user };
}

/**
 * Get all users (for admin purposes, if needed)
 */
export function getAllUsers(): User[] {
  return readUsers();
}
