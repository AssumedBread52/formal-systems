import { System } from '@/system/types/system';
import { redirect } from 'next/navigation';

export const fetchSystem = async (systemId: string): Promise<System> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}`, {
    cache: 'no-store'
  });

  const { ok } = response;

  if (!ok) {
    redirect('/formal-systems');
  }

  return response.json();
};
