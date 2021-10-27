import { C, U } from 'ts-toolbelt';
import { SelectFields } from './utils';
import { BindingAddress } from '@kraftr/context';

export type FieldDefinition<T extends C.Class = any> = {
  kind: 'field';
  type: U.ListOf<T>;
  metadata: Record<string, unknown>;
};

export type Sortable = {
  metadata: {
    sortable: true;
  };
};
export type Hideable = {
  metadata: {
    hideable: true;
  };
};
export type PrimaryKey = {
  metadata: {
    primaryKey: true;
  };
};
/**
 * Array type
 */
export type MultipleValue = {
  metadata: {
    multiple: true;
  };
};
export type SingleValue = {
  metadata: {
    multiple?: undefined;
  };
};

export type ModelKind = 'single-model';

export type ModelReference<T extends ModelDefinition> = SelectFields<T, PrimaryKey>;

export type Relation<T extends ModelDefinition = any> = {
  metadata: {
    sortable: false;
    relation: {
      model: BindingAddress<T>;
    };
  };
};

export type ModelDefinition = {
  name: string;
  kind: ModelKind;
  properties: Record<string, FieldDefinition>;
};
export type MonoOperation<I = any, O = any> = (input: I) => O;

type FieldDefinitionBuild<T> = T extends FieldDefinition
  ? T
  : { result: T; message: 'ModelBuild is not valid' };

export type SingleModelBuilder = () => Record<string, FieldDefinition>;
export type SingleModelFactory<N extends string, F extends SingleModelBuilder> = {
  name: N;
  builder: F;
};

export function createModel<Name extends string, Builder extends SingleModelBuilder>(
  name: Name,
  builder: Builder
): SingleModelFactory<Name, Builder> {
  return { name, builder };
}

export function field<T extends C.Class>(type: T[] | T): FieldDefinition<T>;
export function field<T extends C.Class, B>(
  type: T[] | T,
  fn0: MonoOperation<FieldDefinition<T>, B>
): FieldDefinitionBuild<B>;
export function field<T extends C.Class, B, C>(
  type: T[] | T,
  fn0: MonoOperation<FieldDefinition<T>, B>,
  fn1: MonoOperation<B, C>
): FieldDefinitionBuild<C>;
export function field<T extends C.Class, B, C, D>(
  type: T[] | T,
  fn0: MonoOperation<FieldDefinition<T>, B>,
  fn1: MonoOperation<B, C>,
  fn2: MonoOperation<C, D>
): FieldDefinitionBuild<D>;

export function field<T extends C.Class>(
  type: T[] | T,
  ...operators: MonoOperation[]
): FieldDefinitionBuild<FieldDefinition> {
  const base = {
    type: (Array.isArray(type) ? type : [type]) as [T],
    kind: 'field' as const,
    metadata: {}
  };
  if (!operators.length) return base;

  return operators.reduce((acc, op) => op(acc), base);
}
