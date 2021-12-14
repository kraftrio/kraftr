import { Context } from '@kraftr/context';

export type StartupData = {
  appContext: Context;
};

export type Plugin = {
  install: () => void;
};

export type Application = {
  start: () => void;
  stop: () => void;
  restart: () => void;
  middleware: (...input: unknown[]) => void;
};
