import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../services/userService';

// Credit costs per category
const CREDIT_COSTS: Record<string, number> = {
  'Text Generation': 10,
  'Image Creation': 50,
  'Video Creation': 50,
  'Voice Synthesis': 50,
};

// Default cost for unknown categories
const DEFAULT_CREDIT_COST = 50;

/**
 * Get credit cost for a category
 */
export function getCreditCost(category: string): number {
  return CREDIT_COSTS[category] || DEFAULT_CREDIT_COST;
}

/**
 * Middleware to check if user has sufficient credits
 * Must be used after authenticateUser middleware
 */
export function checkCredits(req: Request, res: Response, next: NextFunction): void {
  try {
    // Ensure user is authenticated (should be set by authenticateUser middleware)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get category from request body
    const { category } = req.body;
    if (!category) {
      res.status(400).json({
        success: false,
        error: 'Category is required',
      });
      return;
    }

    // Get credit cost for this category
    const creditCost = getCreditCost(category);

    // Get user and check credits
    const user = getUserById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Check if user has sufficient credits
    if (user.credits < creditCost) {
      res.status(402).json({
        success: false,
        error: `Insufficient credits. Required: ${creditCost}, Available: ${user.credits}`,
        required: creditCost,
        available: user.credits,
      });
      return;
    }

    // Attach credit cost to request for later use
    (req as any).creditCost = creditCost;

    next();
  } catch (error: any) {
    console.error('Credit check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check credits. Please try again.',
    });
  }
}
