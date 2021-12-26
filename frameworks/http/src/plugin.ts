import { CraftPluginOption } from '@kraftr/build';
import { RequestListener } from 'node:http';

export type HttpDevConfig = {
  app: string;
};

export function dev(config: HttpDevConfig): CraftPluginOption {
  return {
    name: 'http-kraftr-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const appModule = await server.ssrLoadModule(config.app);
        const listener: RequestListener | undefined = appModule['default'];
        if (listener) {
          listener(req, res);
        }
      });
    }
  };
}
