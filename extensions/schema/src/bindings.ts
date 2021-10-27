import { BindingKey } from '@kraftr/context';

export namespace SchemaGBindings {
  export namespace Filters {
    export const INCLUDE = BindingKey.create('extensions.schema.filter-schema.include');
    export const WHERE = BindingKey.create('extensions.schema.filter-schema.where');
    export const FIELDS = BindingKey.create('extensions.schema.filter-schema.fields');
    export const SORT = BindingKey.create('extensions.schema.filter-schema.sort');
    export const SKIP = BindingKey.create('extensions.schema.filter-schema.skip');
    export const LIMIT = BindingKey.create('extensions.schema.filter-schema.limit');
  }
}
