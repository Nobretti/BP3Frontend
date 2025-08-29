## Project Summary

This Angular frontend uploads a JSON process diagram, posts it to a backend reducer endpoint, and displays:
* Original diagram JSON
* Reduced diagram JSON (human tasks + start/end only)

** Important: Backend expected to be running at `http://localhost:8080/api/diagramprocess/reduce` (POST) returning the reduced `ProcessDiagram`.

## Install

```
npm install
```

## Run (development server)

```
npm start
```

Navigate to `http://localhost:4200/` and use the "Choose JSON File" button to upload a `.json` file.

## Build

```
npm run build
```

Artifacts are emitted to `dist/frontend`.

## Run unit tests

```
npm test
```

## Run end-to-end tests (Cypress)

In one terminal, run the app:

```
npm start
```

In another terminal, run Cypress:

```
npm run e2e:open   # interactive
# or
npm run e2e        # headless
```

Notes:
* Ensure the app is running on `http://localhost:4200`.
