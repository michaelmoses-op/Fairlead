# Fairlead

Fairlead is a local diagram tool for software developers. Architecture pictures go stale, and they rarely make the direction of data obvious. Fairlead is a chart you can draw in a few minutes: cards for the places data rests and the programs that move it, and a wire for each movement.

A wire is one direction of data. It has a verb and a short payload name. A request and its response are two wires. One wire does not mean they talk.

The app does not connect to AWS, databases, GitHub, or any other live system. There are no accounts. Diagrams stay in this browser, in localStorage, and in the JSON file you download.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints. The landing page can open an empty chart or the Orders snapshot example.

## Test and build

```bash
npm test
npm run build
```

`npm test` runs the graph rules, the trace, and JSON load in Vitest. `npm run build` typechecks, then builds the production bundle.

## How to read a chart

The right port is output. The left port is input. The arrow points the way the data moves.

“Orders API reads Customer DB” is a wire from Customer DB to Orders API, verb reads, payload “customer row”. The trace under the chart says that sentence back.
