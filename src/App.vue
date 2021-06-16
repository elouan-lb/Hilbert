Snapshots<template>
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
      <div class="snapshots section-container">
        <div class="snapshots-header">
          <h2><span id="display-snapshots-char" @click="displaySnapshots"><span v-if="display_snapshots">▼  </span><span v-else>▶  </span></span>Snapshots</h2>
          <span class="snapshots-ctrls">
            <button class="snapshot-ctrl-btn add-snapshot-btn" title="Add a new snapshot" @click="addSnapshot">New</button>
            <span v-if="display_snapshots_controls">
              <button class="snapshot-ctrl-btn load-snapshot-btn" title="Load this snapshot" @click="loadActiveSnapshot">Load</button>
              <button class="snapshot-ctrl-btn rename-snapshot-btn" title="Rename this snapshot" @click="renameActiveSnapshot">Rename</button>
              <button class="snapshot-ctrl-btn delete-snapshot-btn" title="Delete this snapshot" @click="deleteActiveSnapshot">Delete</button>
            </span>
          </span>
        </div>
        <div v-show="display_snapshots" class="snapshots-list" >
          <snapshot v-for="(snapshot, index) in snapshots" :key="index" :index="index" />
        </div>
      </div>
      <div class="overview section-container">
        <div class="overview-header">
          <h2>Overview</h2>
        </div>
        <OverviewIndex />
      </div>
      <div class="parameters section-container">
        <div class="parameters-header">
          <h2>Parameters</h2>
          <IncrementButton class="parameters-no-btn" @input="updateParametersNo" :value="parameters_no" :min="0" :max="21"/>
          <OverviewZoom />
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
import Snapshot from "./components/Snapshot.vue";
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
    Snapshot,
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
      display_snapshots: false,
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
    snapshots() {
      return this.$store.state.snapshots;
    },
    display_snapshots_controls() {
      return this.$store.state.display_snapshots_controls;
    }
  },
  methods: {
    addSnapshot() {
      this.$store.commit("addSnapshot");
    },
    displaySnapshots() {
      this.display_snapshots = !this.display_snapshots
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
