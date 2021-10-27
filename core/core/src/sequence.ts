import { createSequence } from '@kraftr/sequence';
import { AppBindings } from './bindings';
import { AppGroups } from './sequence-groups';

export const AppLifecycle = createSequence<void>(AppBindings.APP_SEQUENCE, [
  AppGroups.RUNNER
]);
