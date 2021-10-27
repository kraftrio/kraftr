import {
  Binding,
  BindingAddress,
  BindingScope,
  Context,
  filterByTag,
  getContext,
  includesTagValue,
  provide
} from '@kraftr/context';
import { sortListOfGroups } from './sorter';
import { F } from 'ts-toolbelt';

type NextFn<Data = unknown> = (data: Data) => Promise<Data>;
export type SequenceFn<Data = unknown> = (
  data: Data,
  next: NextFn<Data>
) => Promise<Data>;

export type Executor<Data = unknown> = {
  run: SequenceFn<Data>;
};
export type ExecutableSequence<Data = unknown> = SequenceFn<Data> | Executor<Data>;

export function toSequenceFn<Data>(fnOrSeq?: ExecutableSequence<Data>): SequenceFn<Data> {
  if (!fnOrSeq) {
    return (data, next) => next(data);
  }

  if ('run' in fnOrSeq) {
    return fnOrSeq.run.bind(fnOrSeq);
  } else {
    return fnOrSeq;
  }
}

export type SequenceOptions<Data> = {
  group: BindingAddress;
  downstream?: BindingAddress[];
  upstream?: BindingAddress[];
  ex: SequenceFn<Data> | Executor<Data>;
};

export class Sequence<Data> implements Executor<Data> {
  public groups: BindingAddress[] = [];
  private _defaultSequences: SequenceOptions<Data>[] = [];
  private _ctxInits: WeakSet<Context> = new WeakSet();

  constructor(
    public chainName: BindingAddress,
    public defaultGroups: BindingAddress[] = []
  ) {
    this.groups = defaultGroups;
  }

  build(opts: SequenceOptions<Data>[]): Sequence<Data> {
    if (!this.groups.length) {
      this.groups = opts.map((o) => o.group);
    }
    this._defaultSequences = opts;
    return this;
  }

  add(opts: SequenceOptions<Data>): Sequence<Data> {
    const bind = provide(opts.group).in(BindingScope.SINGLETON).with(opts.ex).constant();
    bind.tagMap.set('extensionFor', this.chainName);
    bind.tagMap.set('group', opts.group);
    bind.tagMap.set('upstream', opts.upstream);
    bind.tagMap.set('downstream', opts.downstream);

    return this;
  }

  async run(data: Data, next: NextFn<Data>): Promise<Data> {
    return next(await this.execute(data));
  }

  execute(initialData: Data): Promise<Data> {
    const context = getContext();
    if (!this._ctxInits.has(context)) {
      this._defaultSequences.forEach(this.add.bind(this));
      this._ctxInits.add(context);
    }

    const binds = context.find(
      filterByTag({
        ['extensionFor']: includesTagValue(this.chainName)
      })
    );

    if (!binds) return new Promise((resolve) => resolve(initialData));

    const bindsByGroup = Object.fromEntries(
      binds.map((bind) => [bind.tagMap.get('group'), bind])
    ) as Record<string, Binding<ExecutableSequence<Data>>>;

    // Calculate orders from middleware dependencies
    const ordersFromDependencies: BindingAddress[][] = [];

    for (const bind of binds) {
      const group: string = bind.tagMap.get('group') as string;

      const groupsBefore: string[] = (bind.tagMap.get('upstream') as string[]) ?? [];
      groupsBefore.forEach((d) => ordersFromDependencies.push([d, group]));

      const groupsAfter: string[] = (bind.tagMap.get('downstream') as string[]) ?? [];
      groupsAfter.forEach((d) => ordersFromDependencies.push([group, d]));
    }

    const orderedGroups = sortListOfGroups(...ordersFromDependencies, this.groups);

    /**
     * If there is not groups defined just run all binds associated with
     * this sequence without care about order
     */
    if (orderedGroups.length === 0 && binds.length > 0) {
      orderedGroups.push(...binds.map((b) => b.key));
    }

    const executeFn: F.Function = (
      bindAddresses: BindingAddress[],
      fallback: Data
    ): NextFn<Data> => {
      const key = bindAddresses[0];
      const nextAdresses = bindAddresses.slice(1);
      if (!key) return async (data) => data;

      const bind = bindsByGroup[key];
      const sequenceFn = toSequenceFn(bind?.getOrPropagate());

      return async (data: Data) =>
        sequenceFn(data ?? fallback, executeFn(nextAdresses, data));
    };

    const executor = executeFn(orderedGroups);

    return executor(initialData);
  }
}

export function createSequence<Data>(
  name: BindingAddress<Sequence<Data>>,
  defaultGroupOrder?: BindingAddress[]
): Sequence<Data> {
  return new Sequence(name, defaultGroupOrder);
}
