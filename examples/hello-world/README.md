
# @kraftr/example-hello-world

A simple hello-world application using @kraftr/http-framework!

## Summary

This project shows how to write the simplest http application possible.
Check out
[src/app.ts](./src/app.ts)
to learn how we configured our application to always respond with "Hello
World!".

## Prerequisites

Before we can begin, you'll need to make sure you have some things installed:

- [Node.js](https://nodejs.org/en/) at v16 or greater

Additionally, this tutorial assumes that you are comfortable with certain
technologies, languages and concepts.

- JavaScript (ES6)
- [npm](https://www.npmjs.com/)
- [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)

## Installation

1. Get this example repository.

```sh
pnpx degit kraftrio/kraftr/examples/hello-world
```

2. Switch to the directory.

```sh
cd hello-world

```

3. Install dependencies.

```sh
pnpm i

```

## Use

Start the app:

```sh
pnpm dev
```

The application will start on port `3000`. Use your favourite browser or REST
client to access any path with a GET request, and watch it return
`Hello world!`.

## Tests

Run `pnpm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/kraftrio/kraftr/graphs/contributors).

## License

MIT
