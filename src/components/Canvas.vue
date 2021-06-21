<template>
  <div class="parameters-background-canvas">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import store from "../store/index.js";

export default {
  name: "Canvas",
  store,
  data: function () {
    return {};
  },
  methods: {},
};
// Subscribe to store updates
store.subscribe((mutation, state) => {
  // Store the state object as a JSON string
  localStorage.setItem("store", JSON.stringify(state));
});
</script>
