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

### Lints and fixes files
```
npm run lint
```
