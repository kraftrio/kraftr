import { O } from '@kraftr/common';
import { FieldDefinition, ModelDefinition } from '.';
import merge from 'ts-deepmerge';

/**
 * @param  {string='TestModel'} modelName
 * @param  {O.Partial<ModelDefinition['properties']} properties
 * @param  {O.Partial<FieldDefinition} sharedFieldDef
 * @param  {O.Partial<ModelDefinition} def
 */
export function givenModel(
  modelName: string = 'TestModel',
  properties: O.Partial<ModelDefinition['properties'], 'deep'> = {},
  sharedFieldDef: O.Partial<FieldDefinition, 'deep'> = {},
  def: O.Partial<ModelDefinition, 'deep'> = {}
) {
  const baseFieldDefinition: FieldDefinition = {
    kind: 'field',
    type: ['string'],
    metadata: {}
  };
  const baseModel: ModelDefinition = {
    name: modelName,
    kind: 'single-model',
    properties: {}
  };
  const model = merge(baseModel, def, { properties });
  for (let [field, meta] of Object.entries(model.properties)) {
    model.properties[field] = merge(baseFieldDefinition, sharedFieldDef, meta);
  }

  return model;
}
