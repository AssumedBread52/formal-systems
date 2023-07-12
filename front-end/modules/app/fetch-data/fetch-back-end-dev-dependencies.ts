export const fetchBackEndDevDependencies = async (): Promise<Record<string, string>> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/app/dev-dependencies`);

  return response.json();
};
