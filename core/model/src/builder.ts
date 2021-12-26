import { ModelDefinition } from './model';
import { Filter } from './filter';
import merge from 'deepmerge';

export class QueryBuilder<
  Model extends ModelDefinition,
  Built extends Record<string, unknown>
> {
  constructor(defaultFilter: Filter<Model> | Filter<Model>[] = []) {
    this.filter = [defaultFilter].flat();
  }

  public order = ['include', 'where', 'fields', 'sort', 'skip', 'limit'];
  public filter: Filter<Model>[] = [];

  build(): Filter<Model> | Filter<Model>[] {
    if (this.filter.length === 1) {
      return this.filter[0]!;
    }
    return this.filter;
  }

  /**
   * Add a new filter to the array if not meet the required order
   * @param query
   * @returns
   */
  add(query: Record<string, unknown>): this {
    const lastFilter = this.filter[this.filter.length - 1] ?? {};
    // Last operation last filter
    const lastFilterIndexes = Object.keys(lastFilter)
      .map((op) => this.order.indexOf(op))
      .sort();
    const lastFilterIndex = lastFilterIndexes[lastFilterIndexes.length - 1] ?? 0;

    // first operation of query
    const queryIndexes = Object.keys(query)
      .map((op) => this.order.indexOf(op))
      .sort();
    const queryIndex = queryIndexes[0] ?? this.order.length;

    if (this.filter.length > 0 && queryIndex >= lastFilterIndex) {
      this.filter[this.filter.length - 1] = merge(lastFilter, query);
    } else {
      this.filter.push(query);
    }

    return this;
  }

  include(include: string[]): this {
    return this.add({
      include
    });
  }

  where(where: Record<string, unknown>): this {
    return this.add({
      where
    });
  }

  fields(fields: string | string[]): this {
    const lastFilter = this.filter[this.filter.length - 1] ?? {};
    const lastFields = lastFilter.fields;

    if (lastFields) {
      return this.add({
        fields: [...new Set([[lastFields], [fields]].flat())]
      });
    }

    return this.add({
      fields
    });
  }

  sort(sort: string | string[]): this {
    const lastFilter = this.filter[this.filter.length - 1] ?? {};
    const lastSort = lastFilter.sort;

    if (lastSort) {
      return this.add({
        sort: [...new Set([[lastSort], [sort]].flat())]
      });
    }

    return this.add({
      sort
    });
  }

  skip(skip: number): this {
    return this.add({
      skip
    });
  }

  /**
   * Limit the amount of record to fetch from the database
   * @param max the max number of registries to return
   * @returns is a chainable method so returns itself
   */
  limit(max: number): this {
    return this.add({
      limit: max
    });
  }
}
