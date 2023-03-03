import { UserHandler } from '@/user-back-end/api-handlers';
import { createHandler } from 'next-api-decorators';

export default createHandler(UserHandler);
