import { Binding, BindingAddress, filterByTag, inject } from '@kraftr/context';
import { sortListOfGroups } from './sorter';

export type SequenceTags = {
  chain: string;
  group: string;
  upstream?: BindingAddress[];
  downstream?: BindingAddress[];
};

type NextFn<Data = unknown> = (data: Data) => Promise<Data>;

export type Middleware<Data = unknown> = (
  data: Data,
  next: NextFn<Data>
) => Promise<Data>;

export type ExecutableMiddleware<Data = unknown> =
  | Middleware<Data>
  | { run: Middleware<Data> };

function orderBinds(
  binds: Binding<ExecutableMiddleware, SequenceTags>[]
): BindingAddress[][] {
  const ordersFromDependencies: BindingAddress[][] = [];

  for (const bind of binds) {
    if (!bind.tagMap) continue;
    const group = bind.tagMap.get('group');
    if (!group) continue;
    const groupsBefore = bind.tagMap.get('upstream') ?? [];

    groupsBefore.forEach((d) => ordersFromDependencies.push([d, group]));

    const groupsAfter = bind.tagMap.get('downstream') ?? [];
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

type MiddlewareAddress<Data> = BindingAddress<ExecutableMiddleware<Data>>;

export type MiddlewareStreams<Data> = {
  downstream?: MiddlewareAddress<Data>[];
  upstream?: MiddlewareAddress<Data>[];
};

export type SequenceOptions<Data> = {
  group: string;
  ex: ExecutableMiddleware<Data>;
} & MiddlewareStreams<Data>;

export class Sequence<Data> {
  public chain: BindingAddress = 'Sequence';
  public groups: BindingAddress[] = [];

  async run(data: Data, next: NextFn<Data>): Promise<Data> {
    return next(await this.execute(data));
  }

  execute(initialData: Data): Promise<Data> {
    const context = inject.context();

    const filter = filterByTag({
      chain: this.chain
    });

    const binds = context.find(filter) as unknown as Binding<
      ExecutableMiddleware,
      SequenceTags
    >[];

    if (binds.length === 0) return Promise.resolve(initialData);

    // Calculate orders from middleware dependencies
    const ordersFromDependencies = orderBinds(binds);

    const orderedGroups = sortListOfGroups(...ordersFromDependencies, this.groups);

    /**
     * When there is no a group, run all the bindings associated with
     * this sequence without care about the order
     */
    if (orderedGroups.length === 0 && binds.length > 0) {
      orderedGroups.push(...binds.map((b) => b.tagMap!.get('group')));
    }

    const bindsByGroup = Object.fromEntries(
      binds.map((bind) => [bind.tagMap!.get('group'), bind])
    );

    const executor = executeFn(bindsByGroup, orderedGroups, initialData);

    return executor(initialData) as Promise<Data>;
  }
}

function executeFn<Data>(
  bindsByGroup: Record<string, Binding<ExecutableMiddleware<Data>, SequenceTags>>,
  [address, ...nextAddresses]: BindingAddress[],
  fallback: Data
): NextFn<Data> {
  if (!address) return async (data) => data;

  const bind = bindsByGroup[address];

  return async (data?: Data) => {
    const sequenceFn = toSequenceFn(bind?.value());
    return sequenceFn(
      data ?? fallback,
      executeFn(bindsByGroup, nextAddresses, data ?? fallback)
    );
  };
}
