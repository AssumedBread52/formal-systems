import { store } from '@/app/store';
import { SignUpPage, metadata } from '@/auth/components/sign-up-page/sign-up-page';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import { mockServer } from '@/common/tests/mocks/server';
import { QueryStatus } from '@reduxjs/toolkit/query';
import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

const mockBack = jest.fn<void, []>();
const mockRefresh = jest.fn<void, []>();

jest.mock('next/navigation', (): {
  useRouter: () => {
    back: jest.Mock<void, []>;
    refresh: jest.Mock<void, []>;
  };
} => {
  return {
    useRouter: (): {
      back: jest.Mock<void, []>;
      refresh: jest.Mock<void, []>;
    } => {
      return {
        back: mockBack,
        refresh: mockRefresh
      };
    }
  };
});

describe('/sign-up', (): void => {
  mockMatchMedia();
  mockServer();

  it('renders the sign up page', (): void => {
    const { getByLabelText, getByRole, getByText } = render(<Provider store={store}><SignUpPage /></Provider>);

    expect(getByText('Sign Up')).toBeVisible();
    expect(getByText('First Name')).toBeVisible();
    expect(getByText('Last Name')).toBeVisible();
    expect(getByText('E-mail')).toBeVisible();
    expect(getByText('Password')).toBeVisible();
    expect(getByLabelText('First Name')).toHaveValue('');
    expect(getByLabelText('Last Name')).toHaveValue('');
    expect(getByLabelText('E-mail')).toHaveValue('');
    expect(getByLabelText('Password')).toHaveValue('');

    expect(getByRole('button', {
      name: 'Submit'
    })).toBeEnabled();
    expect(getByRole('button', {
      name: 'Cancel'
    })).toBeEnabled();

    expect(metadata.title).toEqual('Sign Up');
  });

  it('navigates back if cancel is clicked', (): void => {
    const { getByRole } = render(<Provider store={store}><SignUpPage /></Provider>);

    fireEvent.click(getByRole('button', {
      name: 'Cancel'
    }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('fails to submit if fields are blank', async (): Promise<void> => {
    const { getByRole, getByText } = render(<Provider store={store}><SignUpPage /></Provider>);

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(getByText('First name is required.')).toBeVisible();
      expect(getByText('Last name is required.')).toBeVisible();
      expect(getByText('E-mail is required.')).toBeVisible();
      expect(getByText('Password is required.')).toBeVisible();
    });
  });

  it('displays message for invalid e-mail address', async (): Promise<void> => {
    const { getByLabelText, getByText } = render(<Provider store={store}><SignUpPage /></Provider>);

    fireEvent.change(getByLabelText('E-mail'), {
      target: {
        value: 'invalid'
      }
    });

    await waitFor((): void => {
      expect(getByText('Invalid format')).toBeVisible();
    });
  });

  it('displays an error message if sign up fails', async (): Promise<void> => {
    const { getByLabelText, getByRole, getByText } = render(<Provider store={store}><SignUpPage /></Provider>);

    fireEvent.change(getByLabelText('First Name'), {
      target: {
        value: 'Test'
      }
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: {
        value: 'User'
      }
    });
    fireEvent.change(getByLabelText('E-mail'), {
      target: {
        value: 'invalid@test.com'
      }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: {
        value: 'password'
      }
    });

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(getByText('Error')).toBeVisible();
      expect(getByText('Failed to sign up.')).toBeVisible();
    });
  });

  it('successfully signs up', async (): Promise<void> => {
    const { getByLabelText, getByRole } = render(<Provider store={store}><SignUpPage /></Provider>);

    fireEvent.change(getByLabelText('First Name'), {
      target: {
        value: 'Test'
      }
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: {
        value: 'User'
      }
    });
    fireEvent.change(getByLabelText('E-mail'), {
      target: {
        value: 'valid@test.com'
      }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: {
        value: 'password'
      }
    });

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('refreshes the token periodically', async (): Promise<void> => {
    const { getByLabelText, getByRole } = render(<Provider store={store}><SignUpPage /></Provider>);

    fireEvent.change(getByLabelText('First Name'), {
      target: {
        value: 'Test'
      }
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: {
        value: 'User'
      }
    });
    fireEvent.change(getByLabelText('E-mail'), {
      target: {
        value: 'valid@test.com'
      }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: {
        value: 'password'
      }
    });

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      const mutationRequests = Object.values(store.getState().api.mutations);

      expect(mutationRequests).toHaveLength(3);
      expect(mutationRequests).toEqual(expect.arrayContaining([
        expect.objectContaining({
          endpointName: 'signUp',
          status: QueryStatus.fulfilled
        }),
        expect.objectContaining({
          endpointName: 'refreshToken',
          status: QueryStatus.fulfilled
        })
      ]));
    });
  });

  afterEach((): void => {
    mockBack.mockClear();
    mockRefresh.mockClear();
  });
});
