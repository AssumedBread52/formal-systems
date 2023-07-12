export const fetchBackEndDependencies = async (): Promise<Record<string, string>> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/app/dependencies`);

  return response.json();
};
