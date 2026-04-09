// /src/lib/loadingStore.ts
let listeners: ((loading: boolean) => void)[] = [];

export function startLoading() {
  listeners.forEach((l) => l(true));
}

export function stopLoading() {
  listeners.forEach((l) => l(false));
}

export function subscribe(cb: (loading: boolean) => void) {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
}
