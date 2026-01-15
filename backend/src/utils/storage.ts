import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure users.json exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
}

export interface User {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
  lastLogin: string;
}

interface UsersData {
  users: User[];
}

/**
 * Read users from JSON file
 */
export function readUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed: UsersData = JSON.parse(data);
    return parsed.users || [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

/**
 * Write users to JSON file
 */
export function writeUsers(users: User[]): void {
  try {
    const data: UsersData = { users };
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | undefined {
  const users = readUsers();
  return users.find(user => user.id === id);
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | undefined {
  const users = readUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Add or update user
 */
export function saveUser(user: User): void {
  const users = readUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  writeUsers(users);
}
