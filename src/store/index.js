import { createStore } from "vuex";
import moduleWasm from "../wasm/hilberttransposition.js";

/* OSC Connection */
const OSC = require("osc-js");

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
    total_parameters_no: 0,
    snapshots: [],
    total_snapshots_no: 0,
    snapshot_state_buffer: null,
    is_snapshot_loaded: false,
    display_snapshots: false,
    is_recording: false,
    recording_timer: null,
    recording_timer_value: 0,
    recorded_actions: [],
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
      this.state.parameters.forEach((param) => {
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
        this.state.total_parameters_no++;
        this.state.parameters.push({
          active: true,
          name: "/parameter-" + this.state.total_parameters_no,
          min: 0,
          max: 1,
          zoomed_min: 0,
          zoomed_max: this.state.overview_zoom,
          value: 0,
          range_value: 0,
        });
        /* Log mutation */
        if (this.state.is_recording) {
          this.state.recorded_actions.push({
            time: this.state.recording_timer_value,
            action: "addParameter",
            newValue: "",
            oldValue: "",
            name: this.state.parameters[this.state.parameters.length-1].name,
          })
        }
      } else {
        /* Log mutation */
        if (this.state.is_recording) {
          this.state.recorded_actions.push({
            time: this.state.recording_timer_value,
            action: "removeParameter",
            newValue: "",
            oldValue: "",
            name: this.state.parameters[this.state.parameters.length-1].name,
          })
        }
        this.state.parameters.pop();
      }
      state.settings.parameters_no = n;
      /* Compute granularity (max: 8)*/
      this.state.settings.granularity = Math.min(8, Math.floor(63 / n));
    },
    removeParameter(state, index) {
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "removeParameter",
          newValue: "",
          oldValue: "",
          name: this.state.parameters[index].name,
        })
      }
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
        var oldValue = param.value;
        /* Apply zoom level */
        param.value = map_values(
          coordinates[i],
          0,
          1,
          param.zoomed_min,
          param.zoomed_max
        );
        /* Log mutation */
        if (this.state.is_recording) {
          this.state.recorded_actions.push({
            time: this.state.recording_timer_value,
            action: "updateParameterValue",
            newValue: param.value,
            oldValue: oldValue,
            name: param.name,
            min: param.min,
            max: param.max,
            computed: true,
          })
        }
        /* Send OSC */
        var osc_value = new OSC.Message(param.name, param.value);
        osc.send(osc_value);
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
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "updateOverviewIndex",
          newValue: index,
          oldValue: this.state.overview_index,
        })
      }
      this.state.overview_index = index;
    },
    updateOverviewZoom(state, zoom) {
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "updateOverviewZoom",
          newValue: zoom,
          oldValue: this.state.overview_zoom,
        })
      }
      this.state.overview_zoom = zoom;
      this.commit("computeParametersZoomedIntervals");
    },
    updateParameterActiveState(state, payload) {
      this.state.parameters[payload.index].active = payload.active;

      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: (payload.active) ? "unlockParameter" : "lockParameter",
          newValue: "",
          oldValue: "",
          name: this.state.parameters[payload.index].name,
        })
      }
    },
    updateParameterMin(state, payload) {
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "updateParameterMin",
          newValue: payload.min,
          oldValue: this.state.parameters[payload.index].min,
          name: this.state.parameters[payload.index].name,
        })
      }

      this.state.parameters[payload.index].min = payload.min;
    },
    updateParameterMax(state, payload) {
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "updateParameterMax",
          newValue: payload.max,
          oldValue: this.state.parameters[payload.index].max,
          name: this.state.parameters[payload.index].name,
        })
      }

      this.state.parameters[payload.index].max = payload.max;
    },
    updateParameterName(state, payload) {
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "renameParameter",
          newValue: payload.name,
          oldValue: this.state.parameters[payload.index].name,
        })
      }

      this.state.parameters[payload.index].name = payload.name;
    },
    updateParameterValue(state, payload) {
      var param = this.state.parameters[payload.index];

      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "updateParameterValue",
          newValue: payload.value,
          oldValue: param.value,
          name: param.name,
          min: param.min,
          max: param.max,
          computed: false,
        })
      }

      param.value = parseFloat(payload.value);

      /* Send OSC */
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
      this.state.total_snapshots_no ++;
      this.state.snapshots.push({
        name: "Snapshot n°" + this.state.total_snapshots_no,
        selected: false,
        saved_state: {
          parameters_no: this.state.settings.parameters_no,
          overview_zoom: this.state.overview_zoom,
          overview_index: this.state.overview_index,
          parameters: JSON.parse(JSON.stringify(this.state.parameters)),
        },
      });
      this.state.display_snapshots = true;

      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "addSnapshot",
          newValue: "",
          oldValue: "",
          name: this.state.snapshots[this.state.snapshots.length-1].name,
        })
      }
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
        this.state.settings.parameters_no = this.state.snapshot_state_buffer.parameters_no;
        this.state.overview_zoom = this.state.snapshot_state_buffer.overview_zoom;
        this.state.overview_index = this.state.snapshot_state_buffer.overview_index;
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
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "renameSnapshot",
          newValue: payload.name,
          oldValue: this.state.snapshots[payload.index].name,
        })
      }

      this.state.snapshots[payload.index].name = payload.name;
    },
    deleteSnapshot(state, index) {
      /* Log mutation */
      if (this.state.is_recording) {
        this.state.recorded_actions.push({
          time: this.state.recording_timer_value,
          action: "deleteSnapshot",
          newValue: "",
          oldValue: "",
          name: this.state.snapshots[index].name
        })
      }

      this.state.snapshots.splice(index, 1);
    },
    startRecording(state) {
      this.state.is_recording = true

      /* Start timer */
      this.state.recording_timer = setInterval(function() {
        this.state.recording_timer_value++;
      }.bind(this), 1000);
    },
    stopRecording(state) {
      this.state.is_recording = false
      this.state.recorded_actions = [];

      /* Stop timer */
      clearInterval(this.state.recording_timer);
      this.state.recording_timer_value = 0;
    }
  },
  actions: {
    async loadHilbertModule() {
      instance = await moduleWasm();
    },
  },
  modules: {},
});
