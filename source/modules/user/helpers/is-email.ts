export const isEmail = (input: string): boolean => {
  return input.trim().match(/^(.+)@(.+)$/) !== null;
};
