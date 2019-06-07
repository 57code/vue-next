export {
  value,
  isValue,
  observable,
  immutable,
  isObservable,
  isImmutable,
  unwrap,
  markImmutable,
  markNonReactive,
  effect,
  // types
  ReactiveEffect,
  ReactiveEffectOptions,
  DebuggerEvent,
  OperationTypes,
  Value,
  ComputedValue,
  UnwrapValue
} from '@vue/observer'

import {
  computed as _computed,
  ComputedValue,
  ReactiveEffect
} from '@vue/observer'

import { currentInstance } from './component'

// record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordEffect(effect: ReactiveEffect) {
  if (currentInstance) {
    ;(currentInstance.effects || (currentInstance.effects = [])).push(effect)
  }
}

// a wrapped version of raw computed to tear it down at component unmount
export function computed<T, C = null>(
  getter: () => T,
  setter?: (v: T) => void
): ComputedValue<T> {
  const c = _computed(getter, setter)
  recordEffect(c.effect)
  return c
}