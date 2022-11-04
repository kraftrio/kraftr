import { O } from '@kraftr/common';
import { BindingAddress } from '@kraftr/context';
import {
  Hideable,
  ModelDefinition,
  MultipleValue,
  Relation,
  SingleValue,
  Sortable
} from './model';
import { SelectFields } from './utils';

export type Sort<T extends ModelDefinition> = _Sort<T>[] | _Sort<T>;

export type Field<T extends ModelDefinition> =
  | _FieldT<SelectFields<T, Hideable>, '+'>[]
  | _FieldT<SelectFields<T, Hideable>, '-'>[];

export type SingleRelations<T extends ModelDefinition> = SelectFields<
  T,
  SingleValue & Relation
>;
export type MultipleRelations<T extends ModelDefinition> = SelectFields<
  T,
  MultipleValue & Relation
>;

export type Include<T extends ModelDefinition> =
  | 'all'
  | _IncludeArray<T>
  | _IncludeObject<T>;
export type BuiltinOperators = 'eq' | 'ne' | 'in' | 'gt' | 'gte' | 'lt' | 'lte';

export type FilterMultiple<T extends ModelDefinition> = {
  sort?: Sort<T>;
  where?: Record<string, unknown>;
  skip?: number;
  limit?: number;
};

export type FilterSingle<T extends ModelDefinition> = {
  // include: Include<T>;
  fields?: Field<T>;
};

export type Filter<T extends ModelDefinition = ModelDefinition> = FilterMultiple<T> &
  FilterSingle<T>;

type _SortT<T> = `${'+' | '-'}${keyof T & string}`;

type _FieldT<T, P extends string> = `${P}${keyof T & string}`;

type _Sort<T extends ModelDefinition> = _SortT<SelectFields<T, Sortable>>;

type _GetFromBinding<T> = T extends BindingAddress<infer M> ? M : never;

type _GetModel<T> = T extends Relation
  ? _GetFromBinding<T['metadata']['relation']['model']>
  : never;

type _IncludeArray<T extends ModelDefinition> = (keyof SelectFields<T, Relation>)[];

type _IncludeObject<T extends ModelDefinition> = O.Merge<
  {
    [k in keyof SingleRelations<T>]: FilterSingle<_GetModel<SingleRelations<T>[k]>>;
  },
  {
    [k in keyof MultipleRelations<T>]: Filter<_GetModel<MultipleRelations<T>[k]>>;
  }
>;
