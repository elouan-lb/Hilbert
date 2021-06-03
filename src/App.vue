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
    <Settings v-show="display_settings" />
    <div v-show="!display_settings">
      <div class="bookmarks section-container">
        <div class="bookmarks-header">
          <h2>Bookmarks</h2>
        </div>
        <div class="bookmarks-list">
          <Bookmark />
          <Bookmark />
          <Bookmark />
          <Bookmark />
        </div>
      </div>
      <div class="overview section-container">
        <div class="overview-header">
          <h2>Overview</h2>
          <OverviewZoom />
        </div>
        <OverviewIndex />
      </div>
      <div class="parameters section-container">
        <div class="parameters-header">
          <h2>Parameters</h2>
        </div>
        <div class="parameter-section-list">
          <Parameter
            v-for="(p, index) in parameters"
            :key="p.index"
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
import Bookmark from "./components/Bookmark.vue";
import OverviewIndex from "./components/OverviewIndex.vue";
import OverviewZoom from "./components/OverviewZoom.vue";
import Parameter from "./components/Parameter.vue";
import Settings from "./components/Settings.vue";

export default {
  name: "App",
  components: {
    Bookmark,
    OverviewIndex,
    OverviewZoom,
    Parameter,
    Settings,
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
