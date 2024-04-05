import {AsyncLocalStorage} from "async_hooks";
import type {Context} from "./types.ts";

/**
 * It's a private async local storage instance used by dispatcher
 */
const scope = new AsyncLocalStorage<Store>()

class Store {
    private readonly store = new WeakMap<symbol, unknown>();
    private readonly parent?: Store;

    constructor(parent?: Store) {
        this.parent = parent;
    }

    get<T>(context: Context<T>): T | undefined {
        if (this.store.has(context.key)) {
            return this.store.get(context.key) as T;
        }
        if (this.parent === undefined) {
            return context.initial;
        }
        return this.parent.get(context);
    }

    set<T>(context: Context<T>, value: T): void {
        this.store.set(context.key, value);
    }

    /**
     * Creates new children registry
     */
    child() {
        return new Store(this);
    }
}

/**
 * An entrypoint to a lifecycle
 * @param fn
 */
export function dispatch<T = void>(fn: () => T): T {
    const store = scope.getStore();
    return scope.run(store?.child() ?? new Store(), fn)
}

export function getStore(): Store
export function getStore<T extends {optional: boolean}>(options?: T): Store | undefined
export function getStore<T extends Options>(options?: T) {
    const store = scope.getStore()

    if (store === undefined && options?.optional !== true) {
        throw new Error(`Can't define context value outside dispatcher flow`)
    }

    return store;
}

type Options = { optional?: boolean };
