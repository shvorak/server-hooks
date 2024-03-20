import type {Context} from "./types.ts";
import {AsyncLocalStorage} from "async_hooks";

/**
 * It is private async local storage instance used by dispatcher
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
 * Creates context definition
 * @param name Name of the context
 // * @param initial? Initial context value
 */
export function createContext<T>(name: string): Context<T | undefined>
export function createContext<T>(name: string, initial: T): Context<T>
export function createContext<T>(name: string, initial?: T) {
    return {
        key: Symbol(`Context(${name})`),
        name,
        initial
    }
}

/**
 * Define new context value for current scope
 *
 * It's better to create your own specialized context define function
 *
 * ```typescript
 * export function withLogger(data: object, options: LoggerOptions) {
 *    const parent = useLogger();
 *    withContext(Logger, parent.child(data, options));
 * }
 * ```
 *
 * And you will receive exactly a new one logger instance after you call this function
 *
 * ```
 * dispatch(() => {
 *   withLogger({requestId: request.headers['x-request-id']});
 *   return apiAction.execute(request)
 * })
 * ```
 *
 * @param context Context definition
 * @param value Context value
 *
 * @return void
 */
export function withContext<T>(context: Context<T>, value: T): void {
    getStore().set(context, value)
}

/**
 * Trying to receive context value from the current scope
 *
 * You can easily create you own hooks like so:
 * ```typescript
 * export function useLogger() {
 *   return useContext(Logger)
 * }
 * ```
 * And use it inside you entire codebase just like this:
 * ```typescript
 * function createUser(data: User) {
 *   const logger = useLogger();
 *   logger.info('Creating new user with name %s', data.user);
 *   ...
 *   logger.info('User created')
 * }
 * ```
 *
 * @param context
 */
export function useContext<T>(context: Context<T>) {
    const store = scope.getStore()

    if (store === undefined) {
        if (context.initial !== undefined) {
            return context.initial;
        }

        throw new Error(
            `Can't use context value outside dispatcher flow without context initial value\n` +
            `  - Define initial value of context in createContext function\n` +
            `  - Wrap function which uses useContext with dispatch\n`
        )
    }
    return store.get(context);
}

function getStore() {
    const store = scope.getStore()

    if (store === undefined) {
        throw new Error(`Can't define context value outside dispatcher flow`)
    }

    return store;
}

/**
 * An entrypoint to a lifecycle
 * @param fn
 */
export function dispatch<T = void>(fn: () => T): T {
    const store = scope.getStore();
    return scope.run(store?.child() ?? new Store(), fn)
}