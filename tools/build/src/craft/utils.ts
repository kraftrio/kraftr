export async function findConfig() {
  const { findUp } = await import('find-up');
  return await findUp(['craft.config.ts', 'vite.config.ts']);
}
