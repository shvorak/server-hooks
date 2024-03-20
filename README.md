# server-hooks

This library provides very simple way to work with dependencies in your server code

The main point of this library is to provide small abstraction on top of node's `AsyncLocalStorage` API
to define scopes inside your async code. Unlike most of DI solutions it doesn't require you to use decorators or DI instance directly.


## Installation

```bash
npm install -S server-hooks
```

## Usage example

Imagine that you have a logger and you would like to write messages with `requestId` value 
which you are could receive only in your http request handler.
And you would like to use it like so

```typescript
export function myFancyLogic(fancyArg: Fancy) {
    const logger = useLogger();
    // Do some staff
    logger.debug('Fancy work is done');
}
```

First of all we should define our logger context definition

```typescript
import {createContext, useContext, withContext} from "server-hooks";
import {logger} from './your-logger';

// Give a name for the context and 
// let's use current logger as an initial value
const LoggerCtx = createContext("logger", logger);

// Define specified function to define context value
export function withLogger(data: object) {
    withContext(LoggerCtx, useContext(LoggerCtx).child(data))
}

// And just create shorhand hook 
// to easily use it inside your code
export function useLogger() {
    return useContext(LoggerCtx);
}

```

Now let's imagine that we have some framework to deal with http requests and all that 
you need is to call two functions.

```typescript
import {dispatch} from "server-hooks";
import {withLogger} from '../services/logger'

function handler(request: Request) {
    return dispatch(async () => {
        withLogger({requestId: request.headers['x-request-id']});
        return await router.execute(request);
    });
}

```

## Development

This project uses `bun` by default. 

```shell
# Run tests
bun test
# Generate dist output
bun run build
```