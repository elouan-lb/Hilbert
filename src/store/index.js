import { createStore } from "vuex";
import moduleWasm from "../wasm/hilberttransposition.js";

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
    snapshots: [
      {
        name: "Snapshot 0",
        selected: true,
      },
    ],
    display_snapshots_controls: true
  },
  mutations: {
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
      });
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
      this.state.parameters[payload.index].value = parseFloat(payload.value);
    },
    updateParameterRangeValue(state, payload) {
      this.state.parameters[payload.index].range_value = parseFloat(
        payload.range_value
      );
    },
    updateParametersRanges(state) {
      this.state.parameters.forEach((p) => (p.range_value = p.value));
    },
    addSnapshot(state) {
      // /* Unselect every other snapshot */
      // this.state.snapshots.forEach((b) => {
      //   b.selected = false;
      // });
      //
      // this.state.snapshots.push({
      //   name: "Snapshot " + this.state.snapshots.length,
      //   selected: true,
      // });
    },
    selectsnapshot(state, payload) {
      // var snapshot = this.state.snapshots[payload.index];
      // /* Unselect every other snapshot */
      // this.state.snapshots.forEach((b) => {
      //   b.selected = false;
      // });
      // /* Reset data */
      // this.state.settings.parameters_no = payload.state.parameters_no;
      // this.state.overview_zoom = payload.state.overview_zoom;
      // this.state.overview_index = payload.state.overview_index;
      // this.state.parameters = payload.state.parameters;
      // /* Select snapshot */
      // this.state.snapshots[payload.index].selected = true;
    },
    deletesnapshot(state, index) {
      // this.state.snapshots.splice(index, 1);
    },
  },
  actions: {
    async loadHilbertModule() {
      instance = await moduleWasm();
    },
  },
  modules: {},
});
