export const fetchBackEndDevDependencies = async (): Promise<Record<string, string>> => {
  const response = await fetch(`https://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/app/dev-dependencies`);

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
