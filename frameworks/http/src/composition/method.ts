import { useMetadata } from '@kraftr/core';
import { HttpMetadata } from '../bindings';
import { HTTPMethod } from './utils';

export function defineMethod(method: HTTPMethod): void;
export function defineMethod(method: string): void;

export function defineMethod(method: string) {
  const meta = useMetadata(HttpMetadata.CONTROLLER);
  meta.extend({ method });
}
