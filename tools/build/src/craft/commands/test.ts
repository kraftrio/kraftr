import { Command } from 'soly';

export function test(cmd: Command) {
  const { watch } = cmd.flags();
  watch?.alias('w');
}
