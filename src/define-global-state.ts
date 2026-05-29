import { batch, createRoot } from "solid-js";
import { isServer } from "solid-js/web";
import { createDebouncedWatch } from "solid-tiny-utils";
import { buildRealState } from "./base-context";
import type {
  GetterContextThis,
  Getters,
  Methods,
  RealContextThis,
} from "./types";
import type { EmptyObject } from "./utils/types";

export function getBrowserApi<T extends keyof Window>(
  windowApi: T
): Window[T] | null {
  if (!isServer) {
    return window[windowApi];
  }
  return null;
}

function setupPersistence<T extends object>(
  name: string,
  storage: Storage,
  state: T,
  actions: { setState: (...arg: unknown[]) => void }
) {
  interface Stored {
    state: Partial<T>;
  }

  const write = (data: Partial<T>) => {
    const payload: Stored = { state: data };
    storage.setItem(name, JSON.stringify(payload));
  };

  const read = (): Stored | null => {
    const raw = storage.getItem(name);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  // restore localstorage to state
  const restore = () => {
    const stored = read();
    if (stored) {
      batch(() => {
        actions.setState(stored.state);
      });
    } else {
      write(state);
    }
  };

  restore();

  createDebouncedWatch(
    () => JSON.stringify(state),
    () => {
      write(state);
    },
    { delay: 200 }
  );

  // Sync changes across browser tabs.
  window.addEventListener("storage", (e) => {
    if (e.key !== name || !e.newValue) {
      return;
    }
    try {
      const incoming = JSON.parse(e.newValue) as Stored;

      batch(() => {
        actions.setState(incoming.state);
      });
    } catch {
      // do nothing
    }
  });
}

function defineGlobalStore<
  T extends object,
  U extends object = EmptyObject,
  M extends Methods = EmptyObject,
  G extends Getters = EmptyObject,
>(
  name: string,
  params: {
    state: () => T;
    nowrapData?: () => U;
    getters?: G & ThisType<GetterContextThis<T, G>>;
    methods?: M & ThisType<RealContextThis<T, U, G, M>>;
    persist?: "sessionStorage" | "localStorage";
  }
) {
  return createRoot(() => {
    const context = buildRealState({
      state: params.state,
      nowrapData: params.nowrapData?.(),
      getters: params.getters,
      methods: params.methods,
    });

    if (params.persist) {
      const storage = getBrowserApi(params.persist);
      if (storage) {
        const [state, actions] = context;
        setupPersistence(name, storage, state, actions);
      }
    }

    return context;
  });
}

export { defineGlobalStore };
