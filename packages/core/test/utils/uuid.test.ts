import { expect, test } from 'vitest';
import { uuid } from '../../src/utils';

test('matches unhyphenated UUID v4', () => {
  expect(uuid()).toMatch(/[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}/);
});

test('does not produce duplicate UUID', () => {
  const set = new Set();
  for(let i = 0; i < 50; i++) {
    const testUUID = uuid();
    expect(set.has(testUUID)).toBe(false);
    set.add(testUUID);
  }
  expect(set.size).toBe(50);
});
