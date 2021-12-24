import { provide } from '@kraftr/core';
import { RestBindings } from '../bindings';

import type { HttpHeaders } from '../types';

export function useHeaders() {
  return provide<HttpHeaders>(RestBindings.Http.HEADERS).value();
}
