import sirv from 'sirv';
import { useConnect } from './connect';

export function useStatic(rootDir: string) {
  useConnect('static', sirv(rootDir));
}
