import type {
  PersistStorage,
  StateStorage,
  StorageValue,
} from "zustand/middleware";

/** Avoid touching `localStorage` during SSR (Node has no `localStorage`). */
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

/**
 * Zustand persist calls setItem after every state change. Partialize only saves
 * transactions/role/colorMode — when only search/filters change, the serialized
 * payload is identical; skipping the write avoids main-thread stalls from
 * JSON.stringify + localStorage on every keystroke.
 */
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
