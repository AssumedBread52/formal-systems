import { store } from '@/app/store';
import { SignInPage } from '@/auth/components/sign-in-page/sign-in-page';
import { SignOutPage, metadata } from '@/auth/components/sign-out-page/sign-out-page';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import { mockServer } from '@/common/tests/mocks/server';
import { QueryStatus } from '@reduxjs/toolkit/query';
import '@testing-library/jest-dom';
import { fireEvent, getByRole, render, waitFor } from '@testing-library/react';
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

describe('/sign-out', (): void => {
  mockMatchMedia();
  mockServer();

  it('renders the sign out page', (): void => {
    const { getByRole, getByText } = render(<Provider store={store}><SignOutPage /></Provider>);

    expect(getByText('Sign Out')).toBeVisible();

    expect(getByRole('button', {
      name: 'Submit'
    })).toBeEnabled();
    expect(getByRole('button', {
      name: 'Cancel'
    })).toBeEnabled();

    expect(metadata.title).toEqual('Sign Out');
  });

  it('navigates back if cancel is clicked', (): void => {
    const { getByRole } = render(<Provider store={store}><SignOutPage /></Provider>);

    fireEvent.click(getByRole('button', {
      name: 'Cancel'
    }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('displays an error message if sign out fails', async (): Promise<void> => {
    const { container, getByRole, getByText } = render(<Provider store={store}><SignOutPage /></Provider>);

    container.ownerDocument.cookie = 'token=invalid-token';

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(getByText('Error')).toBeVisible();
      expect(getByText('Failed to sign out.')).toBeVisible();
    });
  });

  it('successfully signs out', async (): Promise<void> => {
    const { container, getByRole } = render(<Provider store={store}><SignOutPage /></Provider>);

    container.ownerDocument.cookie = 'token=valid-token';

    fireEvent.click(getByRole('button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('clears the refresh timeout on sign out', async (): Promise<void> => {
    const { getByLabelText, getByTestId } = render(<Provider store={store}><div data-testid='sign-out-page'><SignOutPage /></div><div data-testid='sign-in-page'><SignInPage /></div></Provider>);

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

    fireEvent.click(getByRole(getByTestId('sign-in-page'), 'button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      const mutationRequests = Object.values(store.getState().api.mutations);

      expect(mutationRequests).toHaveLength(2);
      expect(mutationRequests).toEqual(expect.arrayContaining([
        expect.objectContaining({
          endpointName: 'signIn',
          status: QueryStatus.fulfilled
        }),
        expect.objectContaining({
          endpointName: 'refreshToken',
          status: QueryStatus.fulfilled
        })
      ]));
    });

    fireEvent.click(getByRole(getByTestId('sign-out-page'), 'button', {
      name: 'Submit'
    }));

    await waitFor((): void => {
      const mutationRequests = Object.values(store.getState().api.mutations);

      expect(mutationRequests).toHaveLength(3);
      expect(mutationRequests).toEqual(expect.arrayContaining([
        expect.objectContaining({
          endpointName: 'signIn',
          status: QueryStatus.fulfilled
        }),
        expect.objectContaining({
          endpointName: 'refreshToken',
          status: QueryStatus.fulfilled
        }),
        expect.objectContaining({
          endpointName: 'signOut',
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
