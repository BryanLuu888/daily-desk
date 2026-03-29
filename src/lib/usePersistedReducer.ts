"use client";

import { useReducer, useEffect, useRef, type Reducer } from "react";
import { localStorageAdapter, type StorageAdapter } from "./storage";

export function usePersistedReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  defaultState: S,
  storage: StorageAdapter = localStorageAdapter,
): [S, React.Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, defaultState, (initial) => {
    const stored = storage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored) as S;
      } catch {
        return initial;
      }
    }
    return initial;
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    storage.setItem(key, JSON.stringify(state));
  }, [key, state, storage]);

  return [state, dispatch];
}
