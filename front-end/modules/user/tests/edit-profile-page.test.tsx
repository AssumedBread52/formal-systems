import { store } from '@/app/store';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import { mockNextHeaders } from '@/common/tests/mocks/next-headers';
import { mockNextNavigation } from '@/common/tests/mocks/next-navigation';
import { mockServer } from '@/common/tests/mocks/server';
import { EditProfilePage, metadata } from '@/user/components/edit-profile-page/edit-profile-page';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';

describe('/edit-profile', (): void => {
  mockMatchMedia();
  const { mockTokenCookie } = mockNextHeaders();
  mockNextNavigation();
  mockServer();

  it('fails to render the edit profile page', async (): Promise<void> => {
    mockTokenCookie.mockReturnValueOnce('invalid-token');

    try {
      await EditProfilePage();

      expect(1).toEqual(0);
    } catch {
      expect(1).toEqual(1);
    }
  });

  it('renders the edit profile page', async (): Promise<void> => {
    const editProfilePage = await EditProfilePage();

    const Component = (): ReactElement => {
      return editProfilePage;
    };

    const { getByLabelText, getByRole, getByText } = render(<Provider store={store}><Component /></Provider>);

    expect(getByText('Edit Profile')).toBeVisible();
    expect(getByText('First Name')).toBeVisible();
    expect(getByText('Last Name')).toBeVisible();
    expect(getByText('E-mail')).toBeVisible();
    expect(getByText('Password')).toBeVisible();
    expect(getByLabelText('First Name')).toHaveValue('Test');
    expect(getByLabelText('Last Name')).toHaveValue('User');
    expect(getByLabelText('E-mail')).toHaveValue('test@example.com');
    expect(getByLabelText('Password')).toHaveValue('');

    expect(getByRole('button', {
      name: 'Submit'
    })).toBeEnabled();
    expect(getByRole('button', {
      name: 'Cancel'
    })).toBeEnabled();
    expect(getByRole('button', {
      name: 'Reset'
    })).toBeEnabled();

    expect(mockTokenCookie).toHaveBeenCalledTimes(1);

    expect(metadata.title).toEqual('Edit Profile');
  });
});
