import { closeContext, openContext } from '@kraftr/context';
import { ExecutableMiddleware } from './sequence';

type SequenceValues<T> = {
  returnValue: T;
  nextValue: T;
};

export async function testSequence<T>(
  sequence: ExecutableMiddleware<T>,
  data: T,
  useOwnContext = true
): Promise<SequenceValues<T>> {
  if (useOwnContext) {
    openContext();
  }
  let nextValue: T = data;
  const fn = 'run' in sequence ? sequence.run.bind(sequence) : sequence;

  const returnValue = await fn(data, async (result) => {
    nextValue = result;
    return result;
  });

  if (useOwnContext) {
    closeContext();
  }
  return { nextValue, returnValue };
}
