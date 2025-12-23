import NodeCache from "node-cache";

const searchCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export const cacheSearch = (query, results) => {
  const key = `search:${query}`;
  searchCache.set(key, results);
  return results;
};

export const getCachedSearch = (query) => {
  const key = `search:${query}`;
  return searchCache.get(key);
};