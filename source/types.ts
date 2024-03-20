/**
 * Describes context with name, initial value and unique symbol key
 * Also it keeps context type for type inference
 *
 * @see createContext function for more details
 */
export interface Context<T> {
    key: symbol
    name: string
    initial: T
}