import { System } from '@/system/types/system';

export const fetchSystem = async (systemId: string): Promise<System> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}`, {
    cache: 'no-store'
  });

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
