export function addSymbol(watchlist: string[], symbol: string): string[] {
  const normalized = symbol.trim().toUpperCase();
  if (!normalized || watchlist.includes(normalized)) return watchlist;
  return [...watchlist, normalized];
}

export function removeSymbol(watchlist: string[], symbol: string): string[] {
  const normalized = symbol.trim().toUpperCase();
  return watchlist.filter((item) => item !== normalized);
}
