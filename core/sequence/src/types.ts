import { BindingAddress, ExtensionPointTags } from '@kraftr/context';

/**
 * Tags for binds which depends each other
 */
export type DependentBindTags = {
  group: string;
  upstream?: BindingAddress[];
  downstream?: BindingAddress[];
} & ExtensionPointTags;

export type NextFn = () => Promise<void> | void;

export type Middleware = (next: NextFn) => Promise<void> | void;

export interface Sequence<Groups extends string = string> extends Middleware {
  (): Promise<void> | void;

  provide(
    group: Groups,
    middleware: Sequence | Middleware,
    streams?: MiddlewareStreams
  ): void;
  provide(
    group: string,
    middleware: Sequence | Middleware,
    streams?: MiddlewareStreams
  ): void;
}

export type MiddlewareAddress = BindingAddress<Sequence>;

export type MiddlewareStreams = {
  downstream?: MiddlewareAddress[];
  upstream?: MiddlewareAddress[];
};

export type SequenceOptions = {
  group: string;
  ex: Sequence;
} & MiddlewareStreams;
