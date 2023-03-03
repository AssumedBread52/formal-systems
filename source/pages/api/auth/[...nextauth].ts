import { authConfiguration } from '@/auth-back-end/constants';
import NextAuth from 'next-auth/next';

export default NextAuth(authConfiguration);
