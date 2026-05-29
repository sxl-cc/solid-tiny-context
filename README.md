# solid-tiny-context

A tiny, type-safe state management library for SolidJS with component context,
global stores, computed getters, methods, and optional persistence.

## Features

- Lightweight SolidJS state helpers
- Type-safe state, getters, and actions
- Component-level context stores
- Global stores with optional localStorage/sessionStorage persistence
- Cross-tab synchronization for persisted stores
- Automatic batching for custom methods

## Installation

```bash
npm install solid-tiny-context
# or
pnpm add solid-tiny-context
# or
yarn add solid-tiny-context
```

`solid-js` is a peer dependency. `solid-tiny-utils` is a runtime dependency.

## Quick Start

### Global State

```tsx
import { defineGlobalStore } from "solid-tiny-context";

const globalState = defineGlobalStore("myApp", {
  state: () => ({
    count: 0,
    message: "Hello, SolidJS!",
  }),
  nowrapData: () => ({
    step: 1,
  }),
  getters: {
    doubleCount() {
      return this.state.count * 2;
    },
  },
  methods: {
    increment() {
      this.actions.setState("count", (prev) => prev + this.nowrapData.step);
    },
    updateMessage(newMessage: string) {
      this.actions.setState("message", newMessage);
    },
  },
  persist: "localStorage",
});

function Counter() {
  const [state, actions] = globalState;

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Double: {state.doubleCount}</p>
      <p>Message: {state.message}</p>
      <button onClick={() => actions.increment()}>Increment</button>
      <button onClick={() => actions.updateMessage("Updated!")}>
        Update Message
      </button>
    </div>
  );
}
```

### Component State

```tsx
import { createComponentState } from "solid-tiny-context";

const counterContext = createComponentState({
  state: () => ({
    count: 0,
  }),
  methods: {
    increment() {
      this.actions.setState("count", (prev) => prev + 1);
    },
    decrement() {
      this.actions.setState("count", (prev) => prev - 1);
    },
  },
});

function App() {
  const context = counterContext.initial({ count: 1 });

  return (
    <context.Provider>
      <Counter />
    </context.Provider>
  );
}

function Counter() {
  const [state, actions] = counterContext.useContext();

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => actions.increment()}>+</button>
      <button onClick={() => actions.decrement()}>-</button>
    </div>
  );
}
```

## API

### `defineGlobalStore(name, options)`

Creates a global store and returns `[state, actions, nowrapData]`.

Options:

- `state`: function returning the initial reactive state
- `getters`: computed values that can read `this.state`
- `methods`: actions that can read `this.state`, call `this.actions`, and access `this.nowrapData`
- `nowrapData`: function returning non-reactive data for methods
- `persist`: `"localStorage"` or `"sessionStorage"`

Getters intentionally cannot access `nowrapData`. Keep getters derived only from
reactive state so their dependencies stay explicit.

### `createComponentState(options)`

Creates a component context store.

Returns:

- `useContext()`: reads `[state, actions, nowrapData]` from the nearest Provider
- `initial(initialState?)`: creates a Provider and value tuple
- `defaultValue`: the default state factory

`useContext()` throws if it is called outside the matching Provider.

## TypeScript

State, getters, and methods infer their types from the object passed to
`defineGlobalStore` or `createComponentState`.

```tsx
const store = defineGlobalStore("typed", {
  state: () => ({
    count: 0,
  }),
  getters: {
    formattedCount() {
      return `Count: ${this.state.count}`;
    },
  },
  methods: {
    updateCount(newCount: number) {
      this.actions.setState("count", newCount);
    },
  },
});

const [state, actions] = store;

state.formattedCount;
actions.updateCount(1);
```
