import {
  Duplex,
  Readable,
  Stream,
  Transform,
  TransformOptions,
  Writable
} from 'node:stream';
import { hasProperty } from './type-guards';

export function isStream(stream: unknown): stream is Stream {
  return (
    stream !== null && hasProperty(stream, 'pipe') && typeof stream.pipe === 'function'
  );
}

export function toStream(data: unknown) {
  return Readable.from([data], { objectMode: true });
}

export function isWritableStream(stream: unknown): stream is Writable {
  return (
    isStream(stream) &&
    hasProperty(stream, 'writable') &&
    stream.writable !== false &&
    hasProperty(stream, '_write') &&
    typeof stream._write === 'function' &&
    hasProperty(stream, '_writableState') &&
    typeof stream._writableState === 'object'
  );
}

export function isReadableStream(stream: unknown): stream is Readable {
  return (
    isStream(stream) &&
    hasProperty(stream, 'readable') &&
    stream.readable !== false &&
    hasProperty(stream, '_read') &&
    typeof stream._read === 'function' &&
    hasProperty(stream, '_readableState') &&
    typeof stream._readableState === 'object'
  );
}

export function isDuplexStream(stream: unknown): stream is Duplex {
  return (
    isWritableStream(stream) &&
    isReadableStream(stream) &&
    hasProperty(stream, 'allowHalfOpen')
  );
}

export function isTransformStream(stream: unknown): stream is Transform {
  return (
    isDuplexStream(stream) &&
    hasProperty(stream, '_transform') &&
    typeof stream._transform === 'function'
  );
}

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
