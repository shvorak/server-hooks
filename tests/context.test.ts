import {describe, expect, it} from "bun:test";
import {createContext, dispatch, useContext, withContext} from "../source";


describe('context', () => {

    it('should return scoped values in nested scopes', () => {
        const simple = createContext<number>('simple')

        dispatch(() => {
            withContext(simple, 1)
            dispatch(() => {
                withContext(simple, 2)
                expect(useContext(simple)).toBe(2)
            })
            expect(useContext(simple)).toBe(1);
        })

        expect(() => useContext(simple)).toThrow()
    })

    it('should use context value from parent in nested scopes', () => {
        const simple = createContext<number>('simple')

        dispatch(() => {
            withContext(simple, 1)
            dispatch(() => {
                expect(useContext(simple)).toBe(1)
            })
            expect(useContext(simple)).toBe(1)
        })

        expect(() => useContext(simple)).toThrow()
    })

    it('should return initial context value', () => {
        const simple = createContext<number>('simple', 999)

        dispatch(() => {
            expect(useContext(simple)).toBe(999)
        })
    })

    it('should return value from dispatch functions', () => {
        const simple = createContext<number>('simple', 2)
        const second = createContext<number>('second')

        const result = dispatch(() => {
            withContext(second, 2);
            const secondValue = dispatch(() => {
                return useContext(second)!
            })
            const simpleValue = useContext(simple)!
            return simpleValue * secondValue;
        })

        expect(result).toEqual(4)
    })

    it('should not throw an error for context with initial value', () => {
        const simple = createContext<number>('simple', 2)

        expect(useContext(simple)).toBe(2)
    });
})