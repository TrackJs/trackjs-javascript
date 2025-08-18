import { expect, test } from 'vitest';
import { userAgent } from '../../src/utils';

test('Constructs expected userAgent String', () => {
  const result = userAgent("Node", "v22.12.0", "darwin", "arm64", "24.6.0");
  expect(result).toStrictEqual("Node/22.12.0 (darwin arm64 24.6.0)");
});
