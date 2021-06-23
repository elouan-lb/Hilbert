import { createStore } from "vuex";
import moduleWasm from "../wasm/hilberttransposition.js";

/* OSC Connection */
const OSC = require('osc-js')

var osc = new OSC();

osc.open();

const map_values = function (value, in_min, in_max, out_min, out_max) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

var instance; /* WASM instance */

/* TODO: check min / max values. Allow negative values */
export default createStore({
  state: {
    settings: {
      parameters_no: 0 /* TODO: compute parameters_no */,
      host: "",
      port: 0,
      granularity: 0,
    },
    overview_zoom: 1 /* 1: no zoom, 0: maximum zoom */,
    overview_index: 0 /* From 0 to 1 */,
    parameters: [],
    snapshots: [],
    snapshot_state_buffer: null,
    is_snapshot_loaded: false,
    display_snapshots: false,
  },
  mutations: {
    initialiseStore(state) {
      // Check if the ID exists
      if (localStorage.getItem("store")) {
        // Replace the state object with the stored item
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem("store")))
        );
      }
    },
    sendParametersValueWithOSC(state) {
      this.state.parameters.forEach(param => {
        var osc_value = new OSC.Message(param.name, param.value);
        osc.send(osc_value);
      });
    },
    updateSettings(state, payload) {
      /* Update settings */
      state.settings = payload;
    },
    updateParametersNo(state, n) {
      /* Add or remove last parameter */
      if (state.settings.parameters_no < n) {
        this.state.parameters.push({
          active: true,
          name: "/parameter-name",
          min: 0,
          max: 1,
          zoomed_min: 0,
          zoomed_max: this.state.overview_zoom,
          value: 0,
          range_value: 0,
        });
      } else {
        this.state.parameters.pop();
      }
      state.settings.parameters_no = n;
      /* Compute granularity (max: 8)*/
      this.state.settings.granularity = Math.min(8, Math.floor(63 / n));
    },
    removeParameter(state, index) {
      this.state.parameters.splice(index, 1);
      state.settings.parameters_no -= 1;
      /* Compute granularity (max: 8)*/
      this.state.settings.granularity = Math.min(
        8,
        Math.floor(63 / state.settings.parameters_no)
      );
    },
    updateParametersValues(state, coordinates) {
      /* Get coordinates scaled between 0 and 1, then update active parameters values */
      var active_parameters = this.state.parameters.filter((p) => p.active);
      active_parameters.forEach((param, i) => {
        /* Apply zoom level */
        param.value = map_values(
          coordinates[i],
          0,
          1,
          param.zoomed_min,
          param.zoomed_max
        );
        var osc_value = new OSC.Message(param.name, param.value);
        osc.send(osc_value);
      });
      /* Send OSC */
    },
    computeHilbertIndex() {
      /* Compute Hilbert index according to coordinates values */
      var active_parameters = this.state.parameters.filter((p) => p.active);

      /* Scale values to maximum coordinates range */
      var coordinates = [];
      var max_coordinate = 2 ** this.state.settings.granularity - 1;
      var max_index =
        2 ** (this.state.settings.granularity * active_parameters.length) - 1;

      active_parameters.forEach((p) => {
        coordinates.push(
          Math.floor(map_values(p.value, p.min, p.max, 0, max_coordinate))
        );
      });
      var distance_from_coordinates = instance.cwrap(
        "distance_from_coordinates",
        "number",
        ["array", "number", "number"]
      );
      var overview_index = distance_from_coordinates(
        coordinates,
        this.state.settings.granularity,
        active_parameters.length
      );
      this.state.overview_index = Number(overview_index) / max_index;

      // console.log("n: " + active_parameters.length)
      // console.log("p: " + this.state.settings.granularity)
      // console.log("Coordinates: " + coordinates)
      // console.log("Index: " + overview_index)
      // console.log("Index scaled: " + Number(overview_index) / max_index)
    },
    computeParametersZoomedIntervals(state) {
      /* Update zoomed parameters range */
      this.state.parameters.forEach((param, index) => {
        this.commit("computeParameterZoomedInterval", index);
      });
    },
    computeParameterZoomedInterval(state, index) {
      /* Update zoomed parameter range */
      var param = this.state.parameters[index];
      param.zoomed_min =
        param.value - (param.value - param.min) * this.state.overview_zoom;
      param.zoomed_max =
        param.value + (param.max - param.value) * this.state.overview_zoom;
    },
    updateOverviewIndex(state, index) {
      this.state.overview_index = index;
    },
    updateOverviewZoom(state, zoom) {
      this.state.overview_zoom = zoom;
      this.commit("computeParametersZoomedIntervals");
    },
    updateParameterActiveState(state, payload) {
      this.state.parameters[payload.index].active = payload.active;
    },
    updateParameterMin(state, payload) {
      this.state.parameters[payload.index].min = payload.min;
    },
    updateParameterMax(state, payload) {
      this.state.parameters[payload.index].max = payload.max;
    },
    updateParameterName(state, payload) {
      this.state.parameters[payload.index].name = payload.name;
    },
    updateParameterValue(state, payload) {
      var param = this.state.parameters[payload.index];
      param.value = parseFloat(payload.value);

      var osc_value = new OSC.Message(param.name, param.value);
      osc.send(osc_value);
    },
    updateParameterRangeValue(state, payload) {
      this.state.parameters[payload.index].range_value = parseFloat(
        payload.range_value
      );
    },
    updateParametersRanges(state) {
      this.state.parameters.forEach((p) => (p.range_value = p.value));
    },
    displaySnapshots(state) {
      this.state.display_snapshots = !this.state.display_snapshots;
    },
    addSnapshot(state) {
      this.state.snapshots.push({
        name: "Snapshot",
        selected: false,
        saved_state: {
          parameters_no: this.state.settings.parameters_no,
          overview_zoom: this.state.overview_zoom,
          overview_index: this.state.overview_index,
          parameters: JSON.parse(JSON.stringify(this.state.parameters)),
        },
      });
      this.state.display_snapshots = true;
    },
    selectSnapshot(state, index) {
      var snapshot = this.state.snapshots[index];
      /* Unselect every other snapshot */
      this.state.snapshots.forEach((b) => {
        b.selected = false;
      });
      /* Save previous state in buffer */
      this.state.snapshot_state_buffer = JSON.parse(
        JSON.stringify({
          parameters_no: this.state.settings.parameters_no,
          overview_zoom: this.state.overview_zoom,
          overview_index: this.state.overview_index,
          parameters: this.state.parameters,
        })
      );
      /* Reset data */
      this.state.settings.parameters_no = snapshot.saved_state.parameters_no;
      this.state.overview_zoom = snapshot.saved_state.overview_zoom;
      this.state.overview_index = snapshot.saved_state.overview_index;
      this.state.parameters = JSON.parse(
        JSON.stringify(snapshot.saved_state.parameters)
      );

      this.state.snapshots[index].selected = true;

      /* Send OSC values */
      this.commit("sendParametersValueWithOSC");
    },
    unselectSnapshot(state, index) {
      this.state.snapshots[index].selected = false;
      if (this.state.snapshot_state_buffer) {
        /*Revert state */
        this.state.settings.parameters_no =
          this.state.snapshot_state_buffer.parameters_no;
        this.state.overview_zoom =
          this.state.snapshot_state_buffer.overview_zoom;
        this.state.overview_index =
          this.state.snapshot_state_buffer.overview_index;
        this.state.parameters = JSON.parse(
          JSON.stringify(this.state.snapshot_state_buffer.parameters)
        );
        this.state.snapshot_state_buffer = null;

        /* Send OSC values */
        this.commit("sendParametersValueWithOSC");
      }
    },
    loadSnapshot(state, index) {
      var snapshot = this.state.snapshots[index];
      this.state.settings.parameters_no = snapshot.saved_state.parameters_no;
      this.state.overview_zoom = snapshot.saved_state.overview_zoom;
      this.state.overview_index = snapshot.saved_state.overview_index;
      this.state.parameters = JSON.parse(
        JSON.stringify(snapshot.saved_state.parameters)
      );
      /* Update buffer */
      this.state.snapshot_state_buffer = JSON.parse(
        JSON.stringify({
          parameters_no: this.state.settings.parameters_no,
          overview_zoom: this.state.overview_zoom,
          overview_index: this.state.overview_index,
          parameters: this.state.parameters,
        })
      );
    },
    renameSnapshot(state, payload) {
      this.state.snapshots[payload.index].name = payload.name;
    },
    deleteSnapshot(state, index) {
      this.state.snapshots.splice(index, 1);
    },
  },
  actions: {
    async loadHilbertModule() {
      instance = await moduleWasm();
    },
  },
  modules: {},
});
