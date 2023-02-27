import { UserHandler } from '@/user/api';
import { createHandler } from 'next-api-decorators';

export default createHandler(UserHandler);
