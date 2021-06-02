<template>
  <div class="main-container">
    <div class="header section-container">
      <h1 id="title-main">Hilbert-standalone</h1>
      <a id="title-settings" href="#">Settings</a>
    </div>
    <Settings />
  </div>
</template>

<script>
import Settings from "./components/Settings.vue";

export default {
  name: "App",
  components: {
    Settings,
  },
};
</script>

<style>
@import "./assets/styles/style.css";
</style>
