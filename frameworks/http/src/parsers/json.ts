import destr from 'destr';
import { TransformOptions } from 'node:stream';
import { HttpException } from '../http-errors';
import { through } from '@kraftr/common';

// application/json

const stringifyFn: TransformOptions['transform'] = (chunk, _, cb) => {
  const parsed = JSON.stringify(chunk);

  // destr handle parsing error returning the same string
  if (parsed !== chunk) {
    cb(null, parsed);
  } else {
    cb(new HttpException.UnprocessableEntity(), null);
  }
};

const parseFn: TransformOptions['transform'] = (chunk: Buffer, _, cb) => {
  const value = chunk.toString('utf-8');
  const parsed = destr(value);

  // destr handle parsing error returning the same string
  if (parsed !== value) {
    cb(null, parsed);
  } else {
    cb(new HttpException.UnprocessableEntity(), null);
  }
};

export function deserialize() {
  return through(parseFn);
}

export function serialize() {
  return through(stringifyFn);
}
