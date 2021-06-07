import { createStore } from "vuex";

const map_values = function (value, in_min, in_max, out_min, out_max) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

/* TODO: check min / max values. Allow negative values */
export default createStore({
  state: {
    settings: {
      parameters_no: 4,
      host: "",
      port: 0,
      granularity: 0,
    },
    overview_zoom: 1 /* 1: no zoom, 0: maximum zoom */,
    overview_index: 0 /* From 0 to 1 */,
    parameters: [],
  },
  mutations: {
    updateSettings(state, payload) {
      /* Update settings */
      state.settings = payload;
      this.commit("resetParameters");
    },
    resetParameters(state) {
      state.parameters = [];
      for (var i = 0; i < state.settings.parameters_no; i++) {
        state.parameters.push({
          index: i,
          active: true,
          name: "/parameter" + i,
          min: 0,
          max: 1,
          zoomed_min: 0,
          zoomed_max: 1,
          value: 0,
          range_value: 0,
        });
      }
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
    computeParametersZoomedIntervals(state) {
      /* Update zoomed parameters range */
      this.state.parameters.forEach((param) => {
        param.zoomed_min =
          param.value - (param.value - param.min) * this.state.overview_zoom;
        param.zoomed_max =
          param.value + (param.max - param.value) * this.state.overview_zoom;
        console.log();
      });
    },
    resetToBookmark(state, payload) {
      this.state.overview_index = payload.overview_index;
      this.state.overview_zoom = payload.overview_zoom;
      this.state.parameters = payload.parameters;
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
    //TODO: add update for active parameters
  },
  actions: {},
  modules: {},
});
