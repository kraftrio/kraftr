import { O } from '@kraftr/common';
import { FieldDefinition } from '.';
import { ModelDefinition } from './model';
import { RelationModifier } from './modifiers';

export type SelectFields<M extends ModelDefinition, F> = ModelDefinition extends M
  ? Record<string, unknown>
  : O.Select<M['properties'], F>;
export type FilterFields<M extends ModelDefinition, F> = O.Select<M['properties'], F>;

export function filterRelations(
  model: ModelDefinition
): Record<string, FieldDefinition & RelationModifier> {
  const tModel = model as ModelDefinition & {
    properties: Record<string, RelationModifier>;
  };
  return Object.fromEntries(
    Object.entries(tModel.properties).filter(
      ([_, field]) => 'relation' in field.metadata && field.metadata.relation === true
    )
  );
}
