/**
 * useCounter Hook
 * 
 * Abstraction over the global counter store.
 * Allows decoupling components from the specific state management library.
 */

import { useCounterStore } from '../../store/counterStore';

export function useCounter() {
    const count = useCounterStore((state) => state.count);
    const increment = useCounterStore((state) => state.increment);
    const decrement = useCounterStore((state) => state.decrement);
    const reset = useCounterStore((state) => state.reset);

    return {
        count,
        increment,
        decrement,
        reset,
    };
}
