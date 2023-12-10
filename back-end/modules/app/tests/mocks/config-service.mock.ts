export class ConfigServiceMock {
  getOrThrow = jest.fn((key: 'AUTH_COOKIE_MAX_AGE_MILLISECONDS' | 'JSON_WEB_TOKEN_EXPIRES_IN' | 'JSON_WEB_TOKEN_SECRET'): string => {
    switch (key) {
      case 'AUTH_COOKIE_MAX_AGE_MILLISECONDS':
        return '1000';
      case 'JSON_WEB_TOKEN_EXPIRES_IN':
        return '1s';
      case 'JSON_WEB_TOKEN_SECRET':
        return 'secret test token';
    }
  });
};
