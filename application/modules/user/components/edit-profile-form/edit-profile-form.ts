import dynamic from 'next/dynamic';

export const EditProfileForm = dynamic(async () => {
  const { EditProfileForm } = await import('user/edit-profile-form');

  return EditProfileForm;
});
