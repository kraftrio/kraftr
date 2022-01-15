import { Middleware } from '@kraftr/core';
export const findParser: Middleware<void> = async (data, next) => {
  return next();
};
