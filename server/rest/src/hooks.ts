import express from 'express';
import { kraftrApp } from '@kraftr/core';
export type ServerConfig = {
  port: number;
};

export function createServer(app: kraftrApp, config?: ServerConfig): void {
  const instance = express();

  instance.use(app.middleware);

  instance.listen(config?.port ?? 3000);
}
