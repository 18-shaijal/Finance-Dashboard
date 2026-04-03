import type {
  PersistStorage,
  StateStorage,
  StorageValue,
} from "zustand/middleware";

function noopStorage(): StateStorage {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

export function getClientStorage(): StateStorage {
  if (typeof window === "undefined") return noopStorage();
  return window.localStorage;
}

// zustand persist writes on every tick; bail if json didn't change
export function withPersistWriteDedupe<S>(
  inner: PersistStorage<S, unknown> | undefined
): PersistStorage<S, unknown> | undefined {
  if (!inner) return undefined;
  let lastSerialized = "";
  return {
    getItem: (name) => inner.getItem(name),
    setItem: (name, value: StorageValue<S>) => {
      const next = JSON.stringify(value);
      if (next === lastSerialized) return;
      lastSerialized = next;
      return inner.setItem(name, value);
    },
    removeItem: (name) => {
      lastSerialized = "";
      return inner.removeItem(name);
    },
  };
}
