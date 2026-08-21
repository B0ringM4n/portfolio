import { describe, expect, it } from 'vitest';
import { assertUniqueProjectOrder, sortProjects } from '@/lib/project-order';

const entries = [
  { id: 'nexo', data: { order: 3, year: 2024 } },
  { id: 'atlas', data: { order: 1, year: 2026 } },
  { id: 'mono', data: { order: 2, year: 2025 } },
];

describe('project ordering', () => {
  it('sorts by ascending explicit order without mutating input', () => {
    expect(sortProjects(entries).map(({ id }) => id)).toEqual(['atlas', 'mono', 'nexo']);
    expect(entries[0].id).toBe('nexo');
  });

  it('rejects duplicate explicit order values', () => {
    expect(() => assertUniqueProjectOrder([
      entries[0],
      { id: 'duplicate', data: { order: 3, year: 2023 } },
    ])).toThrow('Duplicate project order 3: nexo, duplicate');
  });
});
