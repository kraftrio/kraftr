import { I, O } from 'ts-toolbelt';
import { FieldMetadata } from './types';

export class ModelMetadata<
  Name extends string,
  Type extends Record<string, FieldMetadata<unknown>>
> {
  constructor(public name: Name, public fnConstructor: () => Type) {}

  value(): {};
}

export function createModel<
  N extends string,
  T extends () => Record<string, FieldMetadata<unknown>>
>(modelName: N, fnConstructor: T): ModelMetadata<N, T> {
  return new ModelMetadata(modelName, fnConstructor);
}

export function field<T, M extends object[]>(
  type: T,
  ...metas: M
): O.MergeAll<FieldMetadata<T>, M> {
  return metas.reduce((acc, meta) => Object.assign(acc, meta), {
    type,
    metadata: 'field'
  }) as O.MergeAll<FieldMetadata<T>, M>;
}

// import { C, F, O, U, L } from "ts-toolbelt"

// type TypeResolver = 'string' | 'number' | (() => C.Class)

// export type FieldDefinition = {
//   type: TypeResolver,
//   required?: boolean
//   nullable?: boolean
// }
// export type ModelDefinition = {
//   [field: string]: FieldDefinition
// }

// type ResolveType<T extends TypeResolver> =
//   T extends string ?
//     T extends 'string' ? string : number
//   : T extends F.Function ? InstanceType<F.Return<T>> : never

// type ResolveOptions<T extends object, Opt extends ModelDefinition> =
//   O.NonNullable<
//     O.Required<T, O.SelectKeys<Opt, { required: true }>>,
//     O.SelectKeys<Opt, { nullable: false }>
//   >

// type ModelClassPrototype<T extends ModelDefinition> = ResolveOptions<{
//   [field in keyof T]?:  ResolveType<T[field]['type']> | null
// }, T>

// export type ModelClass<T extends ModelDefinition = ModelDefinition> = {
//   new (values: ModelClassPrototype<T>): ModelClassPrototype<T>
//   prototype: ModelClassPrototype<T>
//   D: T
// }

// export function model<T extends ModelDefinition>(def: T): ModelClass<T> {
//   const cls =
//   return
// }

// const User = model({
//   name: {
//     type: 'string',
//   },
//   age: {
//     type: 'number'
//   }
// })
// const Anonymous = model({
//   device: {
//     type: 'string'
//   }
// })

// export function oneOf<T extends ModelDefinition[]>(...def: T): ModelClass<U.Strict<L.UnionOf<T>>> {
//   return {} as ModelClass<U.Strict<L.UnionOf<T>>>
// }
// export function anyOf<T extends ModelDefinition[]>(...def: T): ModelClass<L.UnionOf<T>> {
//   return {} as ModelClass<L.UnionOf<T>>
// }

// import { C, L, O, U } from 'ts-toolbelt'

// export class GenericError { readonly type = 'ERROR' }
// export class NotFoundError extends GenericError { readonly kind = 'NOT_FOUND' }
// export class DuplicatedKeyError extends GenericError { readonly kind = 'DUPLICATED_KEY_ERROR' }

// export function useRepository(): NotFoundError | DuplicatedKeyError | number {
//     return {}
// }

// export type SelectErrors<T extends unknown> = C.Class<U.Select<T, GenericError>>
// export function hasErrors<T extends unknown, H extends SelectErrors<T>[]>(value: T, ...errors: H): value is InstanceType<H[number]> extends T ? H extends [] ? U.Select<T, GenericError> : InstanceType<H[number]> : never  {
//     return true
// }

// const t = useRepository()

// if(!hasErrors(t)) {
//     t
// } else {
//     t
// }
