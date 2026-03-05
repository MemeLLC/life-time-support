import { useEffect, type EffectCallback } from "react";

const EMPTY = [] as unknown[];

export function useOnMount(fn: EffectCallback) {
  useEffect(fn, EMPTY);
}
