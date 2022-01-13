import { Duplex, Readable, Stream, Transform, Writable } from 'node:stream';
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
