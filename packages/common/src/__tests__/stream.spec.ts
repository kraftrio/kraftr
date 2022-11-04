import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex, Readable, Transform, Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import {
  isDuplexStream,
  isReadableStream,
  isStream,
  isTransformStream,
  isWritableStream,
  toStream
} from '../stream';

describe('isStream()', () => {
  it('returns true for readable stream', () => {
    const stream = new Readable();

    expect(isStream(stream)).toBeTruthy();
  });

  it('returns false for no streams', () => {
    const noStream = {};

    expect(isStream(noStream)).toBeFalsy();
  });

  it('works for ServerResponse', () => {
    expect(isStream(new ServerResponse({} as IncomingMessage))).toBeTruthy();
  });
});

describe('toStream()', () => {
  it('convert an obj to stream', () => {
    expect(isStream(toStream({}))).toBeTruthy();
  });
});

describe('isWritableStream()', () => {
  it('returns true for writable streams', () => {
    const stream = new Writable();

    expect(isWritableStream(stream)).toBeTruthy();
  });
  it('returns false for readable streams', () => {
    const stream = new Readable();

    expect(isWritableStream(stream)).toBeFalsy();
  });

  it('returns false for no streams', () => {
    const noStream = {};

    expect(isWritableStream(noStream)).toBeFalsy();
  });
});

describe('isReadableStream()', () => {
  it('returns true for readable streams', () => {
    const stream = new Readable();

    expect(isReadableStream(stream)).toBeTruthy();
  });

  it('returns false writable streams', () => {
    const stream = new Writable();

    expect(isReadableStream(stream)).toBeFalsy();
  });

  it('returns false for no streams', () => {
    const noStream = {};

    expect(isReadableStream(noStream)).toBeFalsy();
  });
});

describe('isDuplexStream()', () => {
  it('returns true for duplex streams', () => {
    const stream = new Duplex();

    expect(isDuplexStream(stream)).toBeTruthy();
  });

  it('returns false for no streams', () => {
    const stream = {};

    expect(isDuplexStream(stream)).toBeFalsy();
  });

  it('returns false for readable streams', () => {
    const noStream = new Readable();

    expect(isDuplexStream(noStream)).toBeFalsy();
  });

  it('returns false for writable streams', () => {
    const noStream = new Writable();

    expect(isDuplexStream(noStream)).toBeFalsy();
  });
});

describe('isTransformStream()', () => {
  it('returns true for transform streams', () => {
    const stream = new Transform();

    expect(isTransformStream(stream)).toBeTruthy();
  });

  it('returns false for duplex streams', () => {
    const stream = new Duplex();

    expect(isTransformStream(stream)).toBeFalsy();
  });

  it('returns false for no streams', () => {
    const stream = {};

    expect(isTransformStream(stream)).toBeFalsy();
  });

  it('returns false for readable streams', () => {
    const noStream = new Readable();

    expect(isTransformStream(noStream)).toBeFalsy();
  });

  it('returns false for writable streams', () => {
    const noStream = new Writable();

    expect(isDuplexStream(noStream)).toBeFalsy();
  });
});
