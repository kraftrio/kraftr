import { BindingAddress, ExtensionPointTags } from '@kraftr/context';

/**
 * Tags for binds which depends each other
 */
export type DependentBindTags = {
  group: string;
  upstream?: BindingAddress[];
  downstream?: BindingAddress[];
} & ExtensionPointTags;

export type NextFn<Data = unknown> = (data: Data) => Promise<Data>;

export type Middleware<Data = unknown> = (
  data: Data,
  next: NextFn<Data>
) => Promise<Data>;

export type ExecutableMiddleware<Data = unknown> =
  | Middleware<Data>
  | { run: Middleware<Data> };

export type MiddlewareAddress<Data> = BindingAddress<ExecutableMiddleware<Data>>;

export type MiddlewareStreams<Data> = {
  downstream?: MiddlewareAddress<Data>[];
  upstream?: MiddlewareAddress<Data>[];
};

export type SequenceOptions<Data> = {
  group: string;
  ex: ExecutableMiddleware<Data>;
} & MiddlewareStreams<Data>;
