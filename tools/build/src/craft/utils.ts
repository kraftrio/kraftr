export async function findConfig() {
  const { findUp } = await import('find-up');
  return await findUp([
    'craft.config.ts',
    'craft.config.js',
    'vite.config.ts',
    'vite.config.js'
  ]);
}
