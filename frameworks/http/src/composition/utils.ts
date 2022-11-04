import { RouteParams } from '../types';

export type RecordBind<T> = {
  [key in keyof T]: { value: T[key] };
};
export type RouteParamsBinds<T extends string> = RecordBind<RouteParams<T>>;

export { HTTPMethod } from 'find-my-way';
