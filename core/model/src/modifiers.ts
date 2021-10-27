import { O } from 'ts-toolbelt';
import { BindingAddress, BindingKey } from '../../context/src';
import { FieldDefinition, ModelDefinition, MonoOperation } from './model';

export type FieldModifier<Meta extends Record<string, unknown>> = Meta;

export type AutoModifier = { metadata: { autogenerate: true } };

export function auto<A extends FieldDefinition>(): MonoOperation<
  A,
  O.Merge<A, AutoModifier, 'deep'>
> {
  return (i: A) =>
    ({ ...i, metadata: { ...i.metadata, autogenerate: true } } as O.Merge<
      A,
      AutoModifier,
      'deep'
    >);
}

export type RequiredModifier = { metadata: { required: true; hideable: true } };
export function required<A extends FieldDefinition>(): MonoOperation<
  A,
  O.Merge<A, AutoModifier, 'deep'>
> {
  return (i: A) =>
    ({ ...i, metadata: { ...i.metadata, required: true, hideable: false } } as O.Merge<
      A,
      RequiredModifier,
      'deep'
    >);
}

export type RelationModifier<M extends ModelDefinition = ModelDefinition> = {
  metadata: { relation: true; model: BindingAddress<M> };
};
export function relation<A extends FieldDefinition, M extends ModelDefinition>(
  model: M
): MonoOperation<A, O.Merge<A, RelationModifier<M>, 'deep'>> {
  return (i: A) =>
    ({
      ...i,
      metadata: {
        ...i.metadata,
        relation: true,
        model: BindingKey.create<M>(model.name)
      }
    } as O.Merge<A, RelationModifier<M>, 'deep'>);
}
