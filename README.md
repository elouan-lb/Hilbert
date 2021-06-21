# Hilbert

**A web application mapping a single index to an N-dimensional parameter space, easing parameter space explorations for creatives.**

- Sampling is made with the **Hilbert space-filling curve**, with a C implementation of [John Skilling's](https://doi.org/10.1063/1.1751381) algorithm compiled to WebAssembly with Emscripten
- Computed parameters values are sent through OSC with [osc-web](https://github.com/automata/osc-web)

## Vue project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

## Compile C code to WASM

##### Download and install Emscripten

https://emscripten.org/docs/getting_started/downloads.html

MAC OS users can use Homebrew to install emscripten

`brew install emscripten`

##### Compile C code to WASM with Emscripten

```bash
emcc src/wasm/hilberttransposition.c -o hilberttransposition.js -s WASM_BIGINT -s EXPORTED_FUNCTIONS='["_coordinates_from_distance", "_distance_from_coordinates"]' -s MODULARIZE -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'
mv hilberttransposition.js src/wasm/
mv hilberttransposition.wasm public/js/
```

### Issues

- Sliders at wrong position on first click on snapshot, right on second
- Click + click out
