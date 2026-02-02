import { User, IUser } from '../models/User';

const INITIAL_CREDITS = 5000;

/**
 * Create a new user with email
 * Returns existing user if email already exists
 */
export async function createUser(email: string): Promise<IUser> {
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    // Update last login
    existingUser.lastLogin = new Date();
    await existingUser.save();
    return existingUser;
  }

  // Create new user
  const newUser = new User({
    email: email.toLowerCase().trim(),
    credits: INITIAL_CREDITS,
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  await newUser.save();
  return newUser;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({ email: email.toLowerCase().trim() });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<IUser | null> {
  return await User.findById(id);
}

/**
 * Update user credits (add or subtract)
 */
export async function updateUserCredits(userId: string, amount: number): Promise<IUser | null> {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.credits = Math.max(0, user.credits + amount);
  await user.save();
  return user;
}

/**
 * Deduct credits from user
 * Returns true if deduction was successful, false if insufficient credits
 */
export async function deductCredits(userId: string, amount: number): Promise<{ success: boolean; user: IUser | null }> {
  const user = await User.findById(userId);
  if (!user) {
    return { success: false, user: null };
  }

  if (user.credits < amount) {
    return { success: false, user };
  }

  user.credits -= amount;
  await user.save();
  return { success: true, user };
}

/**
 * Get all users (for admin purposes, if needed)
 */
export async function getAllUsers(): Promise<IUser[]> {
  return await User.find();
}
