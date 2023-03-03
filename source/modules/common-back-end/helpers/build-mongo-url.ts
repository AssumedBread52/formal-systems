export const buildMongoUrl = (): string => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const hostname = process.env.MONGO_HOSTNAME;

  const encodedPassword = encodeURIComponent(password ?? '');

  const credentials = `${username}:${encodedPassword}`;

  return `mongodb://${credentials}@${hostname}/formal-systems?authSource=admin`;
};
