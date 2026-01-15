import { Router, Request, Response } from 'express';
import { createUser, getUserByEmail } from '../services/userService';
import { generateToken } from '../utils/jwt';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user with email (or login if exists)
 * Body: { email: string }
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Create or get existing user
    const user = createUser(email.trim());

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user info and token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register user',
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email (same as register for MVP - no password)
 * Body: { email: string }
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Get or create user
    const user = createUser(email.trim());

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user info and token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to login',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires: Authentication middleware
 */
router.get('/me', authenticateUser, (req: Request, res: Response) => {
  try {
    // User is already attached by authenticateUser middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Get full user data
    const user = getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, but we acknowledge it)
 * Requires: Authentication middleware
 */
router.post('/logout', authenticateUser, (req: Request, res: Response) => {
  try {
    // For MVP, logout is handled client-side by removing token
    // This endpoint just acknowledges the logout request
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to logout',
    });
  }
});

export default router;
