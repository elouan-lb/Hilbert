<template>
  <div class="main-container" @mousemove="compute_index_zoom">
    <div class="header section-container">
      <h1 id="title-main" style="display:none">Hilbert</h1>
      <span class="menu-actions">
        <a @click.prevent="startRecording" v-if="!is_recording" class="record"
          >Record</a
        >
        <a @click.prevent="stopRecording" v-if="is_recording" class="recording"
          >Stop</a
        >
        <a @click.prevent="saveParameters" class="save-parameters">Save</a>
        <a @click.prevent="loadParameters" class="load-parameters">Load</a>
        <input
          type="file"
          ref="parametersfileinput"
          @change="onFileChange"
          style="display: none;"
        />
        <a
          id="title-settings"
          href="#"
          @click.prevent="display_about = !display_about"
          >{{ nav }}</a
        >
      </span>
    </div>
    <About v-show="display_about" />
    <div v-show="!display_about">
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
        <OverviewIndex
          @index_mousedown="index_mousedown"
          @index_mouseup="index_mouseup"
          :class="{ hovered: is_snapshot_hovered }"
        />
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
import About from "./components/About.vue";
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
    About,
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
      display_about: false,
      index_mousedown_clientY: false /* If mousedown on index, mouseY offset */,
    };
  },
  computed: {
    nav() {
      if (this.display_about) {
        return "App";
      } else return "About";
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
      let csv = "Timestamp,Action,New Value,Old Value,Name, Min,Max,Computed\n";
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
    saveParameters() {
      const data = JSON.stringify(this.parameters);
      const blob = new Blob([data], { type: "text/plain" });
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = "parameters.json";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
    },
    loadParameters() {
      this.$refs.parametersfileinput.click();
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.readFile(files[0]);
    },
    readFile(file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        let parameters = JSON.parse(e.target.result);
        this.$store.commit("resetParameters", parameters);
      };
      reader.readAsText(file);
    },
    index_mousedown(value) {
      this.index_mousedown_clientY = value;
    },
    index_mouseup(value) {
      this.index_mousedown_clientY = null;
      this.$store.commit("updateOverviewZoom", null);
    },
    compute_index_zoom(e) {
      /* If mousedown on index, compute index zoom from mouse distance */
      if (this.index_mousedown_clientY) {
        this.$store.commit(
          "updateOverviewZoom",
          Math.max(
            0,
            (e.clientY - this.index_mousedown_clientY) / window.innerHeight
          )
        );
      }
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
