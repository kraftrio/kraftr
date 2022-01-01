import { Transform, TransformOptions } from 'node:stream';
export type Serializer = {
  serialize: () => void;
  deserialize: () => void;
};

export function through(transform: TransformOptions['transform']): Transform;

export function through(
  transform: TransformOptions['transform'],
  flush: TransformOptions['flush'] | null
): Transform;

export function through(
  options: TransformOptions,
  transform: TransformOptions['transform'],
  flush: TransformOptions['flush'] | null
): Transform;

export function through(
  optionsOrTransform: TransformOptions | TransformOptions['transform'],
  transformOrFlush?: TransformOptions['transform'] | TransformOptions['flush'] | null,
  flush?: TransformOptions['flush'] | null
) {
  if (typeof optionsOrTransform === 'function') {
    flush = transformOrFlush as never;
    transformOrFlush = optionsOrTransform;
    optionsOrTransform = {};
  }

  const t2 = new Transform({
    objectMode: true,
    highWaterMark: 16,
    ...optionsOrTransform
  });

  if (typeof transformOrFlush !== 'function') {
    // noop
    transformOrFlush = (chunk, _, cb) => cb(null, chunk);
  }

  if (typeof flush !== 'function') {
    flush = null;
  }

  t2._transform = transformOrFlush;
  t2._flush = flush as never;

  return t2;
}
