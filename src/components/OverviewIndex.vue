<template>
  <div class="overview-index">
    <input
      type="range"
      @input="updateOverviewIndex"
      @mousedown="initialiseZoom"
      @mouseup="stopZoom"
      :value="overview_index"
      id="overview-index-slider"
      name="overview-index-slider"
      ref="indexref"
      min="0"
      max="1"
      step="any"
    />
  </div>
</template>

<script>
import store from "../store/index.js";
import moduleWasm from "../wasm/hilberttransposition.js";

var instance; /* WASM instance */

export default {
  name: "OverviewIndex",
  store,
  data: function () {
    return {};
  },
  methods: {
    updateOverviewIndex(e) {
      var value = e.target.value;
      /* Apply zoom */
      if (this.overview_zoom)
        value =
          this.overview_index +
          (value - this.overview_index) / Math.exp(this.overview_zoom * 40);
      this.$refs.indexref.value = value;
      this.$store.commit("updateOverviewIndex", parseFloat(value));
      this.computeHilbertCoordinates();
    },
    initialiseZoom(e) {
      this.$emit("index_mousedown", e.clientY);
    },
    stopZoom(e) {
      this.$emit("index_mouseup");
    },
    computeHilbertCoordinates() {
      if (instance) {
        /* Map the overview index to the size of the Hilbert curve */
        var max_index = 2 ** (this.granularity * this.active_parameters.length); // Maximum index on the curve
        var max_coordinate = 2 ** this.granularity - 1;
        var scaled_index = BigInt(Math.floor(this.overview_index * max_index)); // Convert the float mapped value to a BigInt

        /* Call wasm method */
        var coordinates_from_distance = instance.cwrap(
          "coordinates_from_distance",
          "number",
          ["number", "number", "number"]
        );
        var ptr_from_wasm = coordinates_from_distance(
          scaled_index,
          this.granularity,
          this.active_parameters.length
        );
        var coordinates = [
          ...instance.HEAPU8.subarray(
            ptr_from_wasm,
            ptr_from_wasm + this.active_parameters.length
          ),
        ];

        /* Scale coordinates between 0 and 1 */
        var scaled_coordinates = coordinates.map((x) => x / max_coordinate);
        this.$store.commit("updateParametersValues", scaled_coordinates);
      }
    },
  },
  computed: {
    overview_index() {
      return this.$store.state.overview_index;
    },
    overview_zoom() {
      return this.$store.state.overview_zoom;
    },
    parameters_no() {
      return this.$store.state.settings.parameters_no;
    },
    granularity() {
      return this.$store.state.settings.granularity;
    },
    active_parameters() {
      return this.$store.state.parameters.filter((p) => p.active);
    },
  },
  async created() {
    instance = await moduleWasm();
  },
  mounted() {
    this.$refs.indexref.value = this.overview_index;
  },
};
</script>
