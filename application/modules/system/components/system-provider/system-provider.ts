import dynamic from 'next/dynamic';

export const SystemProvider = dynamic(async () => {
  const { SystemProvider } = await import('system/system-provider');

  return SystemProvider;
});
