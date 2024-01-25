export const pickClientServer = <T>(client: T, server: T): T => {
  if ('undefined' !== typeof window) {
    return client;
  } else {
    return server;
  }
};
