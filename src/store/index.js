import { createStore } from "vuex";

export default createStore({
  state: {
    settings: {
      parameters_no: 6,
      host: "127.0.01",
      port: 7400,
      granularity: 0,
    },
  },
  mutations: {
    updateSettings(state, payload) {
      state.settings = payload;
    },
  },
  actions: {},
  modules: {},
});
