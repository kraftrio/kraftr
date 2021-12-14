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

type NextFn<Data = unknown> = (data: Data) => Promise<Data>;
export type Middleware<Data = unknown> = (
  data: Data,
  next: NextFn<Data>
) => Promise<Data>;

export type ExecutableMiddleware<Data = unknown> = Middleware<Data> | Sequence<Data>;

function orderBinds(binds: Binding[]): BindingAddress[][] {
  const ordersFromDependencies: BindingAddress[][] = [];
  for (const bind of binds) {
    const group: string = bind.tagMap.get('group') as string;

    const groupsBefore: string[] = (bind.tagMap.get('upstream') as string[]) ?? [];
    groupsBefore.forEach((d) => ordersFromDependencies.push([d, group]));

    const groupsAfter: string[] = (bind.tagMap.get('downstream') as string[]) ?? [];
    groupsAfter.forEach((d) => ordersFromDependencies.push([group, d]));
  }
  return ordersFromDependencies;
}

export function toSequenceFn<Data>(
  fnOrSeq?: ExecutableMiddleware<Data>
): Middleware<Data> {
  if (!fnOrSeq) {
    return (data, next) => next(data);
  }

  return 'run' in fnOrSeq ? fnOrSeq.run.bind(fnOrSeq) : fnOrSeq;
}

export type SequenceOptions<Data> = {
  group: BindingAddress<ExecutableMiddleware<Data>>;
  downstream?: BindingAddress<ExecutableMiddleware<Data>>[];
  upstream?: BindingAddress<ExecutableMiddleware<Data>>[];
  ex: ExecutableMiddleware<Data>;
};

export class Sequence<Data> {
  public groups: BindingAddress[] = [];

  #defaultSequences: SequenceOptions<Data>[] = [];
  #ctxInits: WeakSet<Context> = new WeakSet();

  constructor(
    public chainName: BindingAddress,
    public defaultGroups: BindingAddress[] = []
  ) {
    this.groups = defaultGroups;
  }

  /**
   * Prepare with a default sequence array without be inside a context
   * @param options as defaults
   * @returns this
   */
  prepare(options: SequenceOptions<Data>[]): Sequence<Data> {
    if (!this.groups.length) {
      this.groups = options.map((o) => o.group);
    }
    this.#defaultSequences = options;
    return this;
  }

  add(option: SequenceOptions<Data>): Sequence<Data> {
    const bind = provide(option.group)
      .in(BindingScope.SINGLETON)
      .with(option.ex)
      .constant();

    bind.tagMap.set('extensionFor', this.chainName);
    bind.tagMap.set('group', option.group);
    bind.tagMap.set('upstream', option.upstream);
    bind.tagMap.set('downstream', option.downstream);

    return this;
  }

  async run(data: Data, next: NextFn<Data>): Promise<Data> {
    return next(await this.execute(data));
  }

  execute(initialData: Data): Promise<Data> {
    const context = getContext();
    if (!this.#ctxInits.has(context)) {
      this.#defaultSequences.forEach(this.add.bind(this));
      this.#ctxInits.add(context);
    }

    const binds = context.find(
      filterByTag({
        ['extensionFor']: includesTagValue(this.chainName)
      })
    );

    if (!binds) return new Promise((resolve) => resolve(initialData));

    // Calculate orders from middleware dependencies
    const ordersFromDependencies = orderBinds(binds);
    const orderedGroups = sortListOfGroups(...ordersFromDependencies, this.groups);

    /**
     * When there is no a group, run all the bindings associated with
     * this sequence without care about the order
     */
    if (orderedGroups.length === 0 && binds.length > 0) {
      orderedGroups.push(...binds.map((b) => b.key));
    }

    const bindsByGroup = Object.fromEntries(
      binds.map((bind) => [bind.tagMap.get('group'), bind])
    ) as Record<string, Binding<ExecutableMiddleware<Data>>>;

    const executor = executeFn(bindsByGroup, orderedGroups, initialData);

    return executor(initialData);
  }
}

function executeFn<Data>(
  bindsByGroup: Record<string, Binding<ExecutableMiddleware<Data>>>,
  [address, ...nextAdresses]: BindingAddress[],
  fallback: Data
): NextFn<Data> {
  if (!address) return async (data) => data;

  const bind = bindsByGroup[address];
  const sequenceFn = toSequenceFn(bind?.value());

  return async (data?: Data) =>
    sequenceFn(data ?? fallback, executeFn(bindsByGroup, nextAdresses, data ?? fallback));
}

export function createSequence<Data>(
  name: BindingAddress<Sequence<Data>>,
  defaultGroupOrder?: BindingAddress[]
): Sequence<Data> {
  return new Sequence(name, defaultGroupOrder);
}
