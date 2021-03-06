import {
  BindingKey,
  BindingScope,
  component,
  Component,
  createContext,
  isComponent,
  provide,
  Return,
  useMetadata
} from '@kraftr/core';
import { randomUUID } from 'node:crypto';
import { HttpMetadata } from '..';
import { controllerTemplate } from '../template';

export type RequestHandler = () => void;

export type ControllerBuilder = () => RequestHandler;
export type Controller = ControllerBuilder & Component;

export function controller(builder: ControllerBuilder & Partial<Component>): Controller {
  if (!isComponent(builder)) {
    return component(builder, () => {
      useController(builder);
    });
  }
  return builder as Controller;
}

export function controllerKey(name: string) {
  return BindingKey.create(`server.rest.bindings.server.controllers.${name}`);
}

export function useController(controller: ControllerBuilder): Return<void, Error> {
  let controllerName = controller.name === '' ? 'controller' : controller.name;
  controllerName += '-' + randomUUID().split('-')[0];

  const keyBinding = controllerKey(controllerName);
  const controllerBind = provide(keyBinding)
    .dynamic()
    .in(BindingScope.APPLICATION)
    .apply(controllerTemplate)
    .with(() =>
      createContext((ctx) => {
        ctx.name = `context controller: ${controllerName}`;
        const meta = useMetadata(HttpMetadata.CONTROLLER);

        const handler = controller();
        if (!handler || typeof handler !== 'function') {
          // eslint-disable-next-line @kraftr/returns-throw
          throw new Error('Controllers must return a function');
        }
        controllerBind.tag('method', meta.data.method).tag('path', meta.data.path);

        return handler;
      }, BindingScope.METADATA)
    );
  controllerBind.value();
}
