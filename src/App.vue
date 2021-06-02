<template>
  <div class="main-container">
    <div class="header section-container">
      <h1 id="title-main">Hilbert-standalone</h1>
      <a
        id="title-settings"
        href="#"
        @click="display_settings = !display_settings"
        >{{ nav }}</a
      >
    </div>
    <Settings v-if="display_settings" />
    <div v-if="!display_settings">
      <div class="bookmarks section-container">
        <div class="bookmarks-header">
          <h2>Bookmarks</h2>
        </div>
        <div class="bookmarks-list"></div>
      </div>
      <div class="parameters section-container">
        <div class="parameters-header">
          <h2>Parameters</h2>
        </div>
        <div class="parameter-section-list">
          <Parameter
            v-for="(p, index) in parameters"
            :key="p.name"
            :index="index"
          />
        </div>
        <div class="parameters-background-canvas">
          <canvas id="canvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Settings from "./components/Settings.vue";
import Parameter from "./components/Parameter.vue";

export default {
  name: "App",
  components: {
    Settings,
    Parameter,
  },
  data: function () {
    return {
      display_settings: true,
    };
  },
  computed: {
    nav() {
      if (this.display_settings) {
        return "App";
      } else return "Settings";
    },
    parameters() {
      return this.$store.state.parameters;
    },
  },
};
</script>

<style>
@import "./assets/styles/style.css";
</style>
