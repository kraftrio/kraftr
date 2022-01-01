import { createLogger } from '@kraftr/common';
import {
  BindingAddress,
  filterByTag,
  ANY_TAG_VALUE,
  includesTagValue,
  inject
} from '@kraftr/context';
import { DependentBindTags, ExecutableMiddleware, Middleware, NextFn } from './types';
import { createDepSequence } from './utils';

const logger = createLogger('kraftr:sequence:runner');

export class Sequence<Data> {
  public chain: BindingAddress = 'Sequence';
  public groups: BindingAddress[] = [];

  async run(data: Data, next: NextFn<Data>): Promise<Data> {
    return next(await this.execute(data));
  }

  private executeFn<Data>(
    [address, ...nextAddresses]: BindingAddress[],
    fallback: Data
  ): NextFn<Data> {
    if (!address) return async (data) => data;

    return async (data?: Data) => {
      const sequenceFn = toSequenceFn(inject<ExecutableMiddleware<Data>>(address));

      return sequenceFn(
        data ?? fallback,
        this.executeFn(nextAddresses, data ?? fallback)
      );
    };
  }

  execute(initialData: Data): Promise<Data> {
    logger.debug(`Running chain ${this.chain}`);

    const filter = filterByTag<DependentBindTags>({
      extensionFor: includesTagValue(this.chain),
      group: ANY_TAG_VALUE
    });

    const sorted = createDepSequence(filter, this.groups);

    const executor = this.executeFn(sorted, initialData);

    return executor(initialData) as Promise<Data>;
  }
}

export function toSequenceFn<Data>(
  fnOrSeq?: ExecutableMiddleware<Data>
): Middleware<Data> {
  if (!fnOrSeq) {
    return (data, next) => next(data);
  }

  return 'run' in fnOrSeq ? fnOrSeq.run.bind(fnOrSeq) : fnOrSeq;
}
