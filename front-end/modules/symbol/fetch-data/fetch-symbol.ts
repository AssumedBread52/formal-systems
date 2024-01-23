import { Symbol } from '@/symbol/types/symbol';
import { redirect } from 'next/navigation';

export const fetchSymbol = async (systemId: string, symbolId: string): Promise<Symbol> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/symbol/${symbolId}`, {
    cache: 'no-store'
  });

  const { ok } = response;

  if (!ok) {
    redirect(`/formal-system/${systemId}/symbols`);
  }

  return response.json();
};
