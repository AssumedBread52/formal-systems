import { store } from '@/app/store';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import { mockNextHeaders } from '@/common/tests/mocks/next-headers';
import { mockNextNavigation } from '@/common/tests/mocks/next-navigation';
import { mockServer } from '@/common/tests/mocks/server';
import { EditProfilePage, metadata } from '@/user/components/edit-profile-page/edit-profile-page';
import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';

describe('/edit-profile', (): void => {
  mockMatchMedia();
  const { mockTokenCookie } = mockNextHeaders();
  const { mockBack, mockRefresh } = mockNextNavigation();
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

  it('attempts to navigate back if cancel clicked', async (): Promise<void> => {
    const editProfilePage = await EditProfilePage();

    const Component = (): ReactElement => {
      return editProfilePage;
    };

    const { getByRole } = render(<Provider store={store}><Component /></Provider>);

    fireEvent.click(getByRole('button', {
      name: 'Cancel'
    }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('resets input field values if reset clicked', async (): Promise<void> => {
    const editProfilePage = await EditProfilePage();

    const Component = (): ReactElement => {
      return editProfilePage;
    };

    const { getByLabelText, getByRole } = render(<Provider store={store}><Component /></Provider>);

    expect(getByLabelText('First Name')).toHaveValue('Test');
    expect(getByLabelText('Last Name')).toHaveValue('User');
    expect(getByLabelText('E-mail')).toHaveValue('test@example.com');
    expect(getByLabelText('Password')).toHaveValue('');

    fireEvent.change(getByLabelText('First Name'), {
      target: {
        value: 'Test1'
      }
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: {
        value: 'User1'
      }
    });
    fireEvent.change(getByLabelText('E-mail'), {
      target: {
        value: 'test1@example.com'
      }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: {
        value: 'password1'
      }
    });

    await waitFor((): void => {
      expect(getByLabelText('First Name')).toHaveValue('Test1');
      expect(getByLabelText('Last Name')).toHaveValue('User1');
      expect(getByLabelText('E-mail')).toHaveValue('test1@example.com');
      expect(getByLabelText('Password')).toHaveValue('password1');
    });

    fireEvent.click(getByRole('button', {
      name: 'Reset'
    }));

    await waitFor((): void => {
      expect(getByLabelText('First Name')).toHaveValue('Test');
      expect(getByLabelText('Last Name')).toHaveValue('User');
      expect(getByLabelText('E-mail')).toHaveValue('test@example.com');
      expect(getByLabelText('Password')).toHaveValue('');
    });
  });

  it('fails to edit profile with invalid token', async (): Promise<void> => {
    const editProfilePage = await EditProfilePage();

    const Component = (): ReactElement => {
      return editProfilePage;
    };

    const { container, getByRole, getByText } = render(<Provider store={store}><Component /></Provider>);

    container.ownerDocument.cookie = 'token=invalid-token';

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(getByText('Error')).toBeVisible();
      expect(getByText('Failed to edit profile.')).toBeVisible();
    });
  });

  it('edits the user profile', async (): Promise<void> => {
    const editProfilePage = await EditProfilePage();

    const Component = (): ReactElement => {
      return editProfilePage;
    };

    const { container, getByRole } = render(<Provider store={store}><Component /></Provider>);

    container.ownerDocument.cookie = 'token=valid-token';

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
