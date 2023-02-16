export const buildUrlPath = (value: string): string => {
  return value.trim().toLowerCase().replaceAll(' ', '-');
};
