# @kraftr/errors
Very lightweight library with no dependencies to handle errors in a typed way

## Install
`pnpm i @kraftr/errors` or `yarn add @kraftr/errors`

## Usage
```ts
import { Ok, Err, OkErr safe } from '@kraftr/errors'

class CannotBeHome extends Error {}

function isNotHome(x: string): OkErr<string, CannotBeHome> {
  if(x === 'home') {
    return Err(CannotBeHome)
  }
  return Ok(x)
}

const good = isNotHome('good')
const bad = isNotHome('home')

bad.value().toUpperCase()
//         ^ typescript say is not valid
bad.value()!.toUpperCase()
//         ^ typescript allow this but throw an exception at runtime

console.log(good.value()) // Good
console.log(good.value().toUpperCase()) // Good but typescript say type error
console.log(good.value()!.toUpperCase()) // Good

if(good.isOk()) {
  console.log(good.value().toUpperCase()) // Good without type errors
}

if(bad.isErr()) {
  bad.release() // Release the caught exception (same as throw bad.error)
}

const products = safe(() => fetch('xxx')) // works with promises

```



## Requirements
- Typescript target es6+ (to extend properly Error class)
- strictNullCheck
