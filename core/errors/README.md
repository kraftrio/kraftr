<div id="top"></div>

<h1 align="center">
  <img src="./assets/errors-logo.svg" alt="Logo" width="400" height="80" />
</h1>

Very lightweight library with no dependencies to handle errors in a typed way

[Playground Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQBZQgdwM4BoUDKAolBlPgGoCGANgK4CmAsgzFQCZVv4lktuducbKgY0YDcnADyAax6k4AXzgAzDCDgByAAKyoVVTCgB6SWWxaAsAChbqugDsAxjGARHcRx4ByDAOZcwABuDAAUwbSMAFxedCAARpIAlLGO8UlQcAA+KOhY2AA8yMSk0IVaPhmScMDYXgFBoVoAfC2ItnC1qhFRDHCFcAAMyR02XV0w+ZgNM7zQYZXVWXUNgW7NyZ3K21CsdFCekfQMtkq2ts4e2PB72ACMcAC8Xr6NG+EATCO2MACeYH65mgABEuFRHi95lB+BxwYV-oCIKo4Hd7i1fgD+sdGGC2JC4NQTrDBFQEVjkaiGA8MXYbA4XG4PK9HH51iEGAB1YBTaG9E5pZapOKJGq5NAYHCFaHtBDbYA9HH9QYjMYTOBTSWzOB8pailb1RzvDlaLbjHbmvYwA5HPpnC50q6OG5U7CfZ4stlNLk81B875mxFAspQPFUd1QkMk+FByl3T60oNwJVhiOEvrRtjkpEo+O02wmExwTC+4SicSSS7XW7UgDMHpEYgkUDCYVGT3a3lZxtCYU+teSZsLcGgxdLvDgVEc7BksnsTlc7k8Xa9H25UzkvH5MRFmVGcvNCu3yuG++2XStNp1pEWVX1tUNPYYpu250t+0Os+PZrfw6dLruesXhXJ911QTcb37M1bEAgA6JU21gmAICIAAPSAjUcNxaDbOA-wgOgaBnTUsEnTxgSgGC63gvo2wAQiQlD0I8BgsOAHDRmHYB-G8PYyOI6ZujgCiHSPOC6jkM932wWsaJORDkLQjDWOwmhcOHQEoFUBhXBoP4RznGwVDEbB+gPC9qIovCi2cURnFkDVUFWIN7RsIA)

</br>

>🚨🚨 ALERT 🚨🚨</br>
This library is part of the kraftr framework (which is under development), until it reaches a stable version this library will remain as alpha and can receive breaking changes

</br>

## Table of contents <!-- omit in toc -->

</br>

- [1. ❗Requirements](#1-requirements)
- [2. 🚀 Install](#2--install)
- [3. 👨‍💻 Usage](#3--usage)
- [4. 💪 Strongly typed](#4--strongly-typed)
- [5. 🚶‍♂️ When to use](#5-️-when-to-use)
- [6. Enforce the usage](#6-enforce-the-usage)
- [7. 📚 Acknowledgments](#7--acknowledgments)
- [8. 🔍 Related Projects](#8--related-projects)
- [9. 🤝 License](#9--license)

</br>

## 1. ❗Requirements

</br>

- Typescript target es6+ (to extend properly Error class)
- strictNullCheck

<p align="right">
(<a href="#top">back to top</a>)</p>

## 2. 🚀 Install

</br>

`pnpm i @kraftr/errors` or `yarn add @kraftr/errors`

<p align="right">(<a href="#top">back to top</a>)</p>

## 3. 👨‍💻 Usage

</br>
@kraft/errors allow keep 2 types of exceptions `UncheckedExceptions` and `CheckedExceptions`.

Sometimes exceptions should be handle and checked, ex:

```ts
import { Ok, Err } from '@kraftr/errors'
import db from 'any-db'

class FieldError extends Error {}

function createUser(user: User) {
  const creation = shelter(() => db.user.create(user))
  if(creation.isErr) {
    return Err(FieldError)
  }
  return Ok(user)
}

const user = createUser({ name: 'Fuzzy' })

if(user.isOk) {
  console.log('Fuzzy created')
} else {
  console.log('Fuzzy has errors')
}
```

But sometimes errors (shouldn't | cannot) be handled

```ts
import { Ok, Err } from '@kraftr/errors'
import db from 'any-db'

function connectToDb() {
  db.connect('url') // can throw error
}

connectToDb() // even if you caught the error what can you do? you need the database for the next line
const user = db.user.create({ name: 'Fuzzy' })
```

there is a method called guard, guard is aware that you have properly handled all the results that you created, it is especially useful if you forget always to handle errors. (you can get help from the eslint-plugin to enforce the usage too)

```ts
import { Ok, Err, OkErr, shelter, guard } from '@kraftr/errors'

guard(function main() {
  createUser({ name: 'Fuzzy' }) // result without handle
}) // guard check for Results with errors an rethrow the errors if none of .isErr, .isOk is read etc

```

If you need caught a exception threw for a third party library for some reason you can do

```ts
import { Ok, Err, OkErr, shelter } from '@kraftr/errors'
import db from 'any-db'

const connection = shelter(() => db.connect('url'))
if(connection.isOk) {
  const user = db.user.create({ name: 'Fuzzy' })
} else {
  console.log('sorry check the database')
}
```

I know, up to here it seems like shelter is just a sugar syntax for try..catch but that's not true let's see the next section.

<p align="right">(<a href="#top">back to top</a>)</p>

## 4. 💪 Strongly typed

</br>

```ts
import { Ok, Err, OkErr } from '@kraftr/errors'

class CannotBeHome extends Error {}

function isNotHome(x: string): OkErr<string, CannotBeHome> {
  if(x === 'home') {
    return Err(CannotBeHome)
  }
  return Ok(x)
}

bad.value().toUpperCase()
//         ^ typescript say is not valid access to void (can throw exception)

bad.value()!.toUpperCase()
//         ^ here we force to use the value now typescript
//           but at runtime is gonna throw an exception

console.log(good.value()) // Good
console.log(good.value().toUpperCase())
//                      ^ Runtime is good but typescript
//                        say here type error
console.log(good.value()!.toUpperCase()) // Good

if(good.isOk) {
  // Good without type errors
  console.log(good.value().toUpperCase())
}
if(!good.isErr) {
  // Works with "not", here is not type errors
  console.log(good.value().toUpperCase())
}

if(bad.isErr) {
  bad.release() // Release the caught exception (same as throw bad.error)
}

```

But what if we want just work as normal and get typed errors in some situations?

```ts
import { Ok, Err, Return, Throws } from '@kraftr/errors'
import db, { Connection, ConnectionError } from 'any-db'

function connectToDb(): Return<Connection, ConnectionError> {
  return db.connect('url') // can throw error
}

const connection = shelter(connectToDb) //  OkErr<Connection, ConnectionError>
if(connection.isErr) {
  connection.error // properly typed as ConnectionError
}
```

You can either provide type errors for third party functions or the builtin functions

```ts
declare global {
  interface JSON {
    parse(text: object): Record<string, unknown> | Throws<SyntaxError>
  }
}
const parsed = shelter(() => JSON.parse('{;'))
if(parsed.isErr) {
  parsed.error // SyntaxError
}
```

<p align="right">(<a href="#top">back to top</a>)</p>

## 5. 🚶‍♂️ When to use

</br>

> If a client can reasonably be expected to recover from an exception, make it a checked exception. If a client cannot do anything to recover from the exception, make it an unchecked exception

</br>

For unchecked exceptions use 'Return' as type then people can get type suggestion, for checked exceptions you should use Ok & Err or you can just use 'Return' everywhere and keep using as plain js and when you wanna know a type uses a shelter.

<p align="right">(<a href="#top">back to top</a>)</p>

</br>

## 6. Enforce the usage

this library has 2 developed eslint rules to enforce the usages

- no-unused-result // result objects should be handled
- return-throw // functions with throw should have it type in the return signature

## 7. 📚 Acknowledgments

- [Checked and Unchecked Exceptions in Java](https://www.baeldung.com/java-checked-unchecked-exceptions)
- [Expressive error handling in TypeScript and benefits for domain-driven design
](https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86)
- [200 OK! Error Handling in GraphQL](https://www.youtube.com/watch?v=A5-H6MtTvqk)
- [STOP throwing Exceptions!](https://www.youtube.com/watch?v=4UEanbBaJy4&t=5s)
- [Flexible Error Handling w/ the Result Class](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/)

<p align="right">(<a href="#top">back to top</a>)</p>

</br>

## 8. 🔍 Related Projects

- [neverthrow](https://github.com/supermacro/neverthrow)
- [type-safe-errors](https://github.com/wiktor-obrebski/type-safe-errors)

<p align="right">(<a href="#top">back to top</a>)</p>

</br>

## 9. 🤝 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
