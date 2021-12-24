import { closeContext, Context, inject, openContext } from '@kraftr/context';
import { Sequence, toSequenceFn } from 'src';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('toSequenceFn()', () => {
  it('returns a dummy fn when no args are provided', async () => {
    const fn = toSequenceFn();
    const result = await fn('data', (data) => Promise.resolve(data));

    expect(result).toEqual('data');
  });

  it('call `run()` method if is there', async () => {
    const mock = vi.fn();
    const fn = toSequenceFn({ run: mock });
    await fn('data', vi.fn());

    expect(mock).toHaveBeenCalledOnce();
  });

  it('call the function provided', async () => {
    const mock = vi.fn();
    const fn = toSequenceFn(mock);
    await fn('data', vi.fn());

    expect(mock).toHaveBeenCalledOnce();
  });
});

describe('new Sequence():', () => {
  afterEach(() => {
    closeContext();
  });
  beforeEach(() => {
    openContext();
  });

  it('call execute when `run()` is called', async () => {
    const $execute = vi.spyOn(Sequence.prototype, 'execute');
    const seq = new Sequence();

    await seq.run('data', vi.fn());

    expect($execute).toBeCalledWith('data');
  });

  it('returns initial data if any bind is not found', async () => {
    const $ctx = vi.spyOn(Context.prototype, 'find').mockReturnValue([]);
    const $injection = vi.spyOn(inject, 'context').mockReturnValue(new Context());

    const seq = new Sequence();
    const res = await seq.execute('data');

    expect(res).toEqual('data');
    $injection.mockRestore();
    $ctx.mockRestore();
  });
});
