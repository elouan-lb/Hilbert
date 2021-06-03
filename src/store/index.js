import { createStore } from "vuex";

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
          value: 0,
        });
      }
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
      this.state.parameters[payload.index].value = payload.value;
    },
  },
  actions: {},
  modules: {},
});
