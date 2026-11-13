<div id="top"></div>

[![Build][build-shield]][build-url]
[![Language][language-shield]][build-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <h1 align="center">node-app-attest-example</h1>
  <p align="center">
    App and server example of Apple's App Attest protocol.
  </p>
</div>

## About

This repository shows an example implementation of Apple's App Attest protocol, using https://npmjs.com/package/node-app-attest.

- `AppAttestExample/` — the iOS app (SwiftUI), which attests a key and signs requests with it
- `javascript/` — the server in JavaScript
- `typescript/` — the same server in TypeScript

## Running the server

Requires Node.js 24 or later and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm --filter ./javascript start   # or ./typescript
```

The server listens on port 3000. Point `endpoint` in `AppAttestExample/AppAttestExample/ApiClient.swift` at your machine, and change
`BUNDLE_IDENTIFIER` and `TEAM_IDENTIFIER` in the server if you build the app with your own bundle identifier and team.

App Attest only works on a real device, not in the simulator.

## License

MIT License. See `LICENSE` for more information.

[build-shield]: https://img.shields.io/github/actions/workflow/status/uebelack/node-app-attest-example/ci.yml?branch=main&style=for-the-badge
[build-url]: https://github.com/uebelack/node-app-attest-example/actions/workflows/ci.yml
[language-shield]: https://img.shields.io/github/languages/top/uebelack/node-app-attest-example.svg?style=for-the-badge
[language-url]: https://github.com/uebelack/node-app-attest-example
[license-shield]: https://img.shields.io/github/license/uebelack/node-app-attest-example.svg?style=for-the-badge
[license-url]: https://github.com/uebelack/node-app-attest-example/blob/main/LICENSE
