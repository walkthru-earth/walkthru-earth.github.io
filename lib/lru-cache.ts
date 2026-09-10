/** Bounded cache with real access-order eviction. Weights can represent bytes or rows. */
export class LruCache<K, V> {
  private entries = new Map<K, { value: V; weight: number }>();
  private weight = 0;
  constructor(
    private maxWeight: number,
    private maxEntries = Infinity
  ) {}
  get(key: K): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }
  set(key: K, value: V, weight = 1): void {
    this.delete(key);
    if (weight > this.maxWeight) return;
    this.entries.set(key, { value, weight });
    this.weight += weight;
    while (
      this.weight > this.maxWeight ||
      this.entries.size > this.maxEntries
    ) {
      this.delete(this.entries.keys().next().value!);
    }
  }
  delete(key: K): void {
    const entry = this.entries.get(key);
    if (entry) this.weight -= entry.weight;
    this.entries.delete(key);
  }
}
