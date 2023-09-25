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

export const mockNextNavigation = (): {
  mockBack: jest.Mock<void, []>;
  mockRefresh: jest.Mock<void, []>;
} => {
  afterEach((): void => {
    mockBack.mockClear();
    mockRefresh.mockClear();
  });

  return {
    mockBack,
    mockRefresh
  };
};
