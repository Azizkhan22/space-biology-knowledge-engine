// Minimal in-memory TTL cache for expensive, rarely-changing responses
// (the Neo4j knowledge graph and the suggested-articles list). This keeps the
// UI responsive and shields the flaky Atlas/Aura shared tiers from repeated
// heavy queries. Not shared across processes — fine for a single API instance.

const store = new Map();

function get(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expires <= Date.now()) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

function set(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

/**
 * Return the cached value for `key`, or compute it with `producer()`, cache it
 * for `ttlMs`, and return it. Failures are not cached.
 */
async function remember(key, ttlMs, producer) {
  const cached = get(key);
  if (cached !== null) return { value: cached, cached: true };
  const value = await producer();
  set(key, value, ttlMs);
  return { value, cached: false };
}

function clear(key) {
  if (key) store.delete(key);
  else store.clear();
}

module.exports = { get, set, remember, clear };
