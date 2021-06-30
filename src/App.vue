<template>
  <div class="main-container">
    <div class="header section-container">
      <h1 id="title-main">Hilbert-standalone</h1>
      <span class="menu-actions">
        <a @click="startRecording" v-if="!is_recording" class="record">Record actions</a>
        <a @click="stopRecording" v-if="is_recording" class="recording">Stop recording</a>
      <a
        id="title-settings"
        @click="display_settings = !display_settings"
        >{{ nav }}</a
      >
      </span>
    </div>
    <Settings v-show="display_settings" />
    <div v-show="!display_settings">
      <div class="snapshots section-container">
        <div class="snapshots-header">
          <h2>
            <span id="display-snapshots-char" @click="displaySnapshots"
              ><span v-if="display_snapshots">▾ </span
              ><span v-else>▸ </span></span
            >Snapshots
          </h2>
          <span class="snapshots-ctrls">
            <button
              class="snapshot-ctrl-btn add-snapshot-btn"
              title="Add a new snapshot"
              @click="addSnapshot"
            >
              +
            </button>
          </span>
        </div>
        <div v-show="display_snapshots" class="snapshots-list">
          <snapshot
            v-for="(snapshot, index) in snapshots"
            :key="index"
            :index="index"
          />
        </div>
      </div>
      <div class="overview section-container">
        <div class="overview-header">
          <h2>Macro-slider</h2>
        </div>
        <OverviewIndex :class="{ hovered: is_snapshot_hovered }" />
      </div>
      <div class="parameters section-container">
        <div class="parameters-header">
          <h2>Parameters</h2>
          <IncrementButton
            class="parameters-no-btn"
            :class="{ hovered: is_snapshot_hovered }"
            @input="updateParametersNo"
            :value="parameters_no"
            :min="0"
            :max="21"
          />
          <OverviewZoom :class="{ hovered: is_snapshot_hovered }" />
        </div>
        <div class="parameter-section-list">
          <Parameter
            v-for="(p, index) in parameters"
            :key="p.index"
            :index="index"
            :class="{ hovered: is_snapshot_hovered }"
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
    display_snapshots() {
      return this.$store.state.display_snapshots;
    },
    is_snapshot_hovered() {
      /* Check if current state values are similar to the snapshoted ones */
      var selected_snapshot = this.$store.state.snapshots.find(
        (b) => b.selected == true
      );
      var snapshot_state_buffer = this.$store.state.snapshot_state_buffer;
      if (selected_snapshot) {
        return !(
          JSON.stringify(selected_snapshot.saved_state) ===
          JSON.stringify(snapshot_state_buffer)
        );
      }
    },
    is_recording() {
      return this.$store.state.is_recording;
    },
    recorded_actions() {
      return this.$store.state.recorded_actions;
    },
  },
  methods: {
    addSnapshot() {
      this.$store.commit("addSnapshot");
    },
    displaySnapshots() {
      this.$store.commit("displaySnapshots");
    },
    updateParametersNo(e) {
      this.$store.commit("updateParametersNo", e);
    },
    startRecording() {
      this.$store.commit("startRecording");
    },
    stopRecording() {
      /* Download CSV */
      let csv = "Time,Action,New Value,Old Value,Name, Min,Max,Computed\n";
      this.recorded_actions.forEach((value) => {
        for (const key in value) {
          csv += JSON.stringify(value[key]);
          csv += ",";
        }
        csv += "\n";
      });

      const anchor = document.createElement("a");
      anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      anchor.target = "_blank";
      anchor.download = "hilbertRecordedActions.csv";
      anchor.click();
      /* Stop recording */
      this.$store.commit("stopRecording");
      // this.is_recording = false;
    },
  },
  beforeCreate() {
    this.$store.commit("initialiseStore");
  },
};
</script>

<style>
@import "./assets/styles/style.css";
</style>
