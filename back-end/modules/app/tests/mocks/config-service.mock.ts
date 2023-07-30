export class ConfigServiceMock {
  getOrThrow = jest.fn((key: 'JSON_WEB_TOKEN_SECRET' | 'JSON_WEB_TOKEN_EXPIRES_IN'): string => {
    switch (key) {
      case 'JSON_WEB_TOKEN_SECRET':
        return 'secret test token';
      case 'JSON_WEB_TOKEN_EXPIRES_IN':
        return '1s';
    }
  });
};
