import dynamic from 'next/dynamic';

export const CreateSystemForm = dynamic(async () => {
  const { CreateSystemForm } = await import('system/create-system-form');

  return CreateSystemForm;
});
