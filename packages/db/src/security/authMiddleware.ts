import { ethers } from 'ethers';
import { rateLimitMiddleware } from './rateLimiter';
import { validateWalletAddress } from './inputValidation';

export interface AuthContext {
  walletAddress: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Middleware to verify wallet signature and authenticate user
 * @param signature The signature to verify
 * @param message The message that was signed
 * @param walletAddress The wallet address that signed the message
 * @returns The authentication context
 */
export async function authenticateUser(
  signature: string,
  message: string,
  walletAddress: string
): Promise<AuthContext> {
  try {
    // Validate wallet address format
    const validatedAddress = validateWalletAddress(walletAddress);
    
    // Apply rate limiting
    const rateLimit = await rateLimitMiddleware(validatedAddress);
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    // Verify the signature
    const signerAddress = ethers.verifyMessage(message, signature);
    
    // Check if the signer matches the provided wallet address
    if (ethers.getAddress(signerAddress) !== ethers.getAddress(validatedAddress)) {
      throw new Error('Invalid signature for the given wallet address');
    }

    // In a real app, you would check if the user exists in your database here
    // and fetch their roles/permissions
    const isAdmin = false; // Replace with actual admin check

    return {
      walletAddress: validatedAddress,
      isAuthenticated: true,
      isAdmin,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed');
  }
}

/**
 * Middleware to check if a user is authenticated
 * @param context The authentication context
 * @returns The authentication context if authenticated, throws otherwise
 */
export function requireAuth(context: AuthContext): AuthContext {
  if (!context.isAuthenticated) {
    throw new Error('Authentication required');
  }
  return context;
}

/**
 * Middleware to check if a user is an admin
 * @param context The authentication context
 * @returns The authentication context if admin, throws otherwise
 */
export function requireAdmin(context: AuthContext): AuthContext {
  requireAuth(context);
  
  if (!context.isAdmin) {
    throw new Error('Admin privileges required');
  }
  
  return context;
}
