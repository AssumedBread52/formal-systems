export const mockMatchMedia = (): void => {
  const { matchMedia } = window;

  beforeAll((): void => {
    window.matchMedia = (query: string): MediaQueryList => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        addListener: jest.fn(),
        dispatchEvent: jest.fn(),
        removeEventListener: jest.fn(),
        removeListener: jest.fn()
      };
    };
  });

  afterAll((): void => {
    window.matchMedia = matchMedia;
  });
};
