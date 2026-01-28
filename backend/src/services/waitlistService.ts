import fs from 'fs';
import path from 'path';

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  joinedAt: string;
  emailSent: boolean;
  ipAddress?: string;
}

const WAITLIST_FILE = path.join(__dirname, '../../data/waitlist.json');

// Initialize waitlist file if it doesn't exist
function initializeWaitlistFile(): void {
  const dataDir = path.dirname(WAITLIST_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(WAITLIST_FILE)) {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2));
  }
}

// Read all waitlist entries
function readWaitlist(): WaitlistEntry[] {
  try {
    initializeWaitlistFile();
    const data = fs.readFileSync(WAITLIST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading waitlist:', error);
    return [];
  }
}

// Write waitlist entries
function writeWaitlist(entries: WaitlistEntry[]): boolean {
  try {
    initializeWaitlistFile();
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(entries, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing waitlist:', error);
    return false;
  }
}

/**
 * Add email to waitlist
 */
export function addToWaitlist(email: string, name?: string, ipAddress?: string): { 
  success: boolean; 
  message: string;
  isNew: boolean;
} {
  const waitlist = readWaitlist();
  
  // Check if email already exists
  const existing = waitlist.find(entry => entry.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return {
      success: true,
      message: 'Email already on waitlist',
      isNew: false
    };
  }

  // Add new entry
  const newEntry: WaitlistEntry = {
    id: `WL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    name,
    joinedAt: new Date().toISOString(),
    emailSent: false,
    ipAddress
  };

  waitlist.push(newEntry);
  const saved = writeWaitlist(waitlist);

  if (!saved) {
    return {
      success: false,
      message: 'Failed to save to waitlist',
      isNew: false
    };
  }

  console.log(`✅ Added to waitlist: ${email} (ID: ${newEntry.id})`);
  return {
    success: true,
    message: 'Successfully added to waitlist',
    isNew: true
  };
}

/**
 * Mark email as sent
 */
export function markEmailSent(email: string, sent: boolean = true): boolean {
  const waitlist = readWaitlist();
  const entry = waitlist.find(e => e.email.toLowerCase() === email.toLowerCase());
  
  if (!entry) {
    console.error(`Entry not found for email: ${email}`);
    return false;
  }

  entry.emailSent = sent;
  return writeWaitlist(waitlist);
}

/**
 * Get waitlist statistics
 */
export function getWaitlistStats(): {
  total: number;
  emailsSent: number;
  emailsPending: number;
} {
  const waitlist = readWaitlist();
  return {
    total: waitlist.length,
    emailsSent: waitlist.filter(e => e.emailSent).length,
    emailsPending: waitlist.filter(e => !e.emailSent).length
  };
}

/**
 * Check if email exists in waitlist
 */
export function isOnWaitlist(email: string): boolean {
  const waitlist = readWaitlist();
  return waitlist.some(e => e.email.toLowerCase() === email.toLowerCase());
}
