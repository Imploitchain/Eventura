import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

interface UserSession {
  id: string;
  walletAddress: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as UserSession | undefined;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
