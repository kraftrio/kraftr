export function User() {
  const firstName = field('string');
  const lastName = field('string');
  const fullName = computed('string', () => firstName.value + lastName.value);
  const altFullName = computed('string', '{{firstName}} {{lastName}}');
  const hash = computed('string', 'hash');
  const password = field('string', { onSave: 'password' });
  const createdAt = field('date', { onCreate: 'date' });
  const updatedAt = field('date', { onUpdate: 'date' });

  return { hash, firstName, password, fullName, updatedAt, createdAt };
}
