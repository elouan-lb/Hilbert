<template>
  <div class="about section-container">
    <h2>About</h2>
    <p> <i>Hilbert</i> is a a web application mapping a single index to an N-dimensional parameter space, easing parameter space explorations for creatives.</p>
    <p>Sampling is made with the Hilbert space-filling curve, with a C implementation of John Skilling's algorithm compiled to WebAssembly with Emscripten</p>
    <p>Computed parameters values are sent as OSC messages via UDP on <b>port 4000</b> with <b>localhost.</b></p>
  </div>
</template>

<script>

export default {
  name: "About",
  data: function () {
    return
  }
};
</script>
