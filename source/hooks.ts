import type {Context} from "./types.ts";
import {getStore} from "./store.ts";

/**
 * Creates context definition without initial value
 * @param name Name of the context
 */
export function createContext<T>(name: string): Context<T | undefined>
/**
 * Creates context definition with initial value so context always have it
 * @param name
 * @param initial
 */
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
 * store(() => {
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

export function withContext<T>(context: Context<T>, value: T | ((current: T) => T)): void {
    if (isFunction(value)) {
        value = value(useContext(context))
    }
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
export function useContext<T>(context: Context<T>): T {
    const store = getStore({optional: isDefined(context.initial)});

    if (store === undefined) {
        return context.initial;
    }
    return store.get(context) as T;
}

// private

function isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
}