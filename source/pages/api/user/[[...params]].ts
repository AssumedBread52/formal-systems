import { UserHandler } from '@/user-backend/api-handlers';
import { createHandler } from 'next-api-decorators';

export default createHandler(UserHandler);
