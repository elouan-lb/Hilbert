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
          <h2>Bookmarks
            <button class="add-bookmark-btn" title="Save a new bookmark" @click="addBookmark">Add</button>
          </h2>
        </div>
        <div class="bookmarks-list">
          <Bookmark v-for="(bookmark, index) in bookmarks" :key="index" :index="index" ref="bookmarks"/>
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
          <IncrementButton @input="updateParametersNo" :value="parameters_no" :min="0" :max="21"/>
        </div>
        <div class="parameter-section-list">
          <Parameter
            v-for="(p, index) in parameters"
            :key="p.index"
            :index="index"
          />
        </div>
        <!-- <Canvas /> -->
      </div>
    </div>
  </div>
</template>

<script>
import Bookmark from "./components/Bookmark.vue";
import Canvas from "./components/Canvas.vue";
import IncrementButton from "./components/IncrementButton.vue";
import OverviewIndex from "./components/OverviewIndex.vue";
import OverviewZoom from "./components/OverviewZoom.vue";
import Parameter from "./components/Parameter.vue";
import Settings from "./components/Settings.vue";
import store from "./store/index.js";

export default {
  name: "App",
  components: {
    Bookmark,
    Canvas,
    IncrementButton,
    OverviewIndex,
    OverviewZoom,
    Parameter,
    Settings,
  },
  store,
  data: function () {
    return {
      display_settings: false,
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
    parameters_no() {
      return this.$store.state.settings.parameters_no;
    },
    bookmarks() {
      return this.$store.state.bookmarks;
    },
  },
  methods: {
    addBookmark() {
      this.$store.commit("addBookmark");
      /* Focus on input for name */
      console.log(this.$refs.bookmarks);
    },
    updateParametersNo(e) {
      this.$store.commit("updateParametersNo", e);
    }
  }
};
</script>

<style>
@import "./assets/styles/style.css";
</style>
