import { inject } from '@kraftr/core';
import { RestBindings } from '../bindings';

export function useHeaders() {
  return inject(RestBindings.Http.HEADERS);
}
