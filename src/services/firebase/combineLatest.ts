import type { Unsubscribe } from 'firebase/firestore';

type Sources<T> = { [K in keyof T]: (emit: (value: T[K]) => void) => Unsubscribe };

/** Subscribes to several listeners and emits once every one has produced a value, then on each change. */
export const combineLatest = <T extends Record<string, unknown>>(
  sources: Sources<T>,
  onChange: (values: T) => void,
): Unsubscribe => {
  const keys = Object.keys(sources) as (keyof T)[];
  const latest: Partial<T> = {};
  const received = new Set<keyof T>();

  const unsubscribes = keys.map((key) =>
    sources[key]((value) => {
      latest[key] = value;
      received.add(key);
      if (received.size === keys.length) onChange({ ...latest } as T);
    }),
  );

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};
