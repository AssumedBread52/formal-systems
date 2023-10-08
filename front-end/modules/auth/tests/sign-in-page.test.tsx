import { store } from '@/app/store';
import { SignInPage, metadata } from '@/auth/components/sign-in-page/sign-in-page';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
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

  afterEach((): void => {
    mockBack.mockClear();
    mockRefresh.mockClear();
  });
});
