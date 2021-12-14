import { createSequence } from '@kraftr/sequence';
import { CoreBindings } from './binding-keys';
import { AppGroups } from './sequence-groups';

export const AppLifecycle = createSequence<void>(CoreBindings.APP_SEQUENCE, [
  AppGroups.RUNNER
]);
