import { C } from '@kraftr/common';
import { BindingKey, inject, provide } from '@kraftr/context';
import { Sequence } from './sequence';

export namespace testlab {
  export function runSequence<Data>(sequence: C.Class<[], Sequence<Data>>, data: Data) {
    const key = BindingKey.generate<Sequence<Data>>('sequence-test');
    provide(key).with(sequence).class();
    const seq = inject(key);

    return seq.execute(data);
  }
}
