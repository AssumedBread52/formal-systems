import { hasText } from '@/common/helpers';
import { NewFormalSystemPayload } from '@/formal-system/types';

export const validateNewFormalSystemPayload = (payload: NewFormalSystemPayload): boolean => {
  const { title, description } = payload;

  return hasText(title) && hasText(description);
};
