import { store } from '@/app/store';
import { SignInPage } from '@/auth/components/sign-in-page/sign-in-page';
import { mockMatchMedia } from '@/common/tests/mocks/match-media';
import { render } from '@testing-library/react';
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
    render(<Provider store={store}><SignInPage /></Provider>);
  });

  afterEach((): void => {
    mockBack.mockClear();
    mockRefresh.mockClear();
  });
});
