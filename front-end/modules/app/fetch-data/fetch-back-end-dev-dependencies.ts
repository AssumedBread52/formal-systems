export const fetchBackEndDevDependencies = async (): Promise<Record<string, string>> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/app/dev-dependencies`);

  return response.json();
};
