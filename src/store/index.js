import { createStore } from "vuex";

export default createStore({
  state: {
    settings: {
      parameters_no: 0,
      host: "",
      port: 0,
      granularity: 0,
    },
    parameters: [],
  },
  mutations: {
    updateSettings(state, payload) {
      state.settings = payload;
      /* Reset parameters */
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
