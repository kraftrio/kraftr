import { BindingKey, BindingScope, provide } from '@kraftr/context';

import PrettyError from 'pretty-error';
import { component } from './hooks';

export const PrettyErrorKey = BindingKey.create<PrettyError>('extensions.pretty-error');

export const PErrorComponent = component(() => {
  const pe = new PrettyError();
  pe.appendStyle({
    'pretty-error > header > title > kind': {
      padding: '0 1'
    },
    'pretty-error > header > colon': {
      display: 'none'
    },
    'pretty-error > header > message': {
      color: 'bright-red',
      padding: '0 1'
    },

    // each trace item ...
    'pretty-error > trace > item': {
      marginLeft: 2,
      bullet: '"<grey>o</grey>"'
    },

    'pretty-error > trace > item > header > pointer > file': {
      color: 'bright-magenta'
    },

    'pretty-error > trace > item > header > pointer > colon': {
      color: 'magenta'
    },

    'pretty-error > trace > item > header > pointer > line': {
      color: 'bright-magenta'
    },

    'pretty-error > trace > item > header > what': {
      color: 'bright-white'
    }
  });
  provide(PrettyErrorKey).in(BindingScope.APPLICATION).with(pe).constant();
  pe.skipNodeFiles();
  pe.skipPath('internal/modules/cjs/loader.js');
  pe.start();
});
