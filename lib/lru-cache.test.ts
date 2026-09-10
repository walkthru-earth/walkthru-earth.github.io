import { describe, expect, it } from 'vitest';
import { LruCache } from './lru-cache';

describe('LruCache', () => {
  it('evicts by least recent access until the row or byte budget is met', () => {
    const cache = new LruCache<string, string>(10);
    cache.set('a', 'first', 4);
    cache.set('b', 'second', 3);
    cache.set('c', 'third', 3);
    expect(cache.get('a')).toBe('first');

    cache.set('d', 'fourth', 6);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBeUndefined();
    expect(cache.get('a')).toBe('first');
    expect(cache.get('d')).toBe('fourth');
  });

  it('also bounds entry count, even for zero-weight entries', () => {
    const cache = new LruCache<string, number>(100, 2);
    cache.set('a', 1, 0);
    cache.set('b', 2, 0);
    cache.get('a');
    cache.set('c', 3, 0);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    expect(cache.get('c')).toBe(3);
  });

  it('releases the previous weight when replacing or deleting an entry', () => {
    const cache = new LruCache<string, number>(10);
    cache.set('a', 1, 8);
    cache.set('a', 2, 3);
    cache.set('b', 3, 7);
    expect(cache.get('a')).toBe(2);
    cache.delete('b');
    cache.delete('missing');
    cache.set('c', 4, 7);
    expect(cache.get('a')).toBe(2);
    expect(cache.get('c')).toBe(4);
  });

  it('does not evict unrelated entries for a value larger than its entire budget', () => {
    const cache = new LruCache<string, number>(10);
    cache.set('a', 1, 5);
    cache.set('oversize', 2, 11);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('oversize')).toBeUndefined();
    cache.set('a', 3, 11);
    expect(cache.get('a')).toBeUndefined();
  });
});
