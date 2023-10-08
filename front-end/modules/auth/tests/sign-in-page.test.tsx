import { store } from '@/app/store';
import { SignInPage, metadata } from '@/auth/components/sign-in-page/sign-in-page';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import { mockServer } from '@/common/tests/mocks/server';
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

describe('/sign-in', (): void => {
  mockMatchMedia();
  mockServer();

  it('renders the sign in page', (): void => {
    const { getByLabelText, getByRole, getByText } = render(<Provider store={store}><SignInPage /></Provider>);

    expect(getByText('Sign In')).toBeVisible();
    expect(getByText('E-mail')).toBeVisible();
    expect(getByText('Password')).toBeVisible();
    expect(getByLabelText('E-mail')).toHaveValue('');
    expect(getByLabelText('Password')).toHaveValue('');

    expect(getByRole('button', {
      name: 'Submit'
    })).toBeEnabled();
    expect(getByRole('button', {
      name: 'Cancel'
    })).toBeEnabled();

    expect(metadata.title).toEqual('Sign In');
  });

  it('navigates back if cancel is clicked', (): void => {
    const { getByRole } = render(<Provider store={store}><SignInPage /></Provider>);

    fireEvent.click(getByRole('button', {
      name: 'Cancel'
    }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('fails to submit if fields are blank', async (): Promise<void> => {
    const { getByRole, getByText } = render(<Provider store={store}><SignInPage /></Provider>);

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(getByText('E-mail is required.')).toBeVisible();
      expect(getByText('Password is required.')).toBeVisible();
    });
  });

  it('displays message for invalid e-mail address', async (): Promise<void> => {
    const { getByLabelText, getByText } = render(<Provider store={store}><SignInPage /></Provider>);

    fireEvent.change(getByLabelText('E-mail'), {
      target: {
        value: 'invalid'
      }
    });

    await waitFor((): void => {
      expect(getByText('Invalid format')).toBeVisible();
    });
  });

  it('displays an error message if sign in fails', async (): Promise<void> => {
    const { getByLabelText, getByRole, getByText } = render(<Provider store={store}><SignInPage /></Provider>);

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
      expect(getByText('Failed to sign in.')).toBeVisible();
    });
  });

  afterEach((): void => {
    mockBack.mockClear();
    mockRefresh.mockClear();
  });
});
