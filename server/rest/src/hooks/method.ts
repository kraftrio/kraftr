import { useMetadata } from '@kraftr/core';
import { RestMetadata } from '../bindings';
import { HTTPMethod } from './utils';

export function defineMethod(method: HTTPMethod): void;
export function defineMethod(method: string): void;

export function defineMethod(method: string) {
  const meta = useMetadata(RestMetadata.CONTROLLER);
  meta.extend({ method });
}
