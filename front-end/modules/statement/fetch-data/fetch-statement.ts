import { Statement } from '@/statement/types/statement';
import { redirect } from 'next/navigation';

export const fetchStatement = async (systemId: string, statementId: string): Promise<Statement> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/statement/${statementId}`, {
    cache: 'no-store'
  });

  const { ok } = response;

  if (!ok) {
    redirect(`/formal-system/${systemId}/statements`);
  }

  return response.json();
};
