export const fetchBackEndDependencies = async (): Promise<Record<string, string>> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/app/dependencies`);

  return response.json();
};
