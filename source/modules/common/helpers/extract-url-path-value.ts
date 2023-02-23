import { GetServerSidePropsContext } from 'next';

export const extractUrlPathValue = (context: GetServerSidePropsContext, key: string): string => {
  const { params = {} } = context;

  const value = params[key] ?? '';

  return value.toString();
};
