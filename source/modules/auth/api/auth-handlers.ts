import { authConfiguration } from '@/auth/constants';
import NextAuth from 'next-auth/next';

export const authHandlers = NextAuth(authConfiguration);
