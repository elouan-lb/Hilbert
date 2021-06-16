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
      <div class="snapshots section-container">
        <div class="snapshots-header">
          <h2>Snapshots
          </h2>
            <button class="add-snapshot-btn" title="Add a new working snapshot" @click="addsnapshot">Save</button>
            <button class="add-snapshot-btn" title="Add a new working snapshot" @click="addsnapshot">Save new</button>
        </div>
        <div class="snapshots-list">
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
  },
  methods: {
    addsnapshot() {
      this.$store.commit("addsnapshot");
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
