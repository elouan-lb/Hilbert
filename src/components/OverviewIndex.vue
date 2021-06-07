<template>
  <div class="overview-index">
    <input
      type="range"
      :value="overview_index"
      @input="updateOverviewIndex"
      id="overview-index-slider"
      name="overview-index-slider"
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
    return {
      test: 0,
      distance_from_coordinates: null,
    };
  },
  methods: {
    updateOverviewIndex(e) {
      this.$store.commit("updateOverviewIndex", parseFloat(e.target.value));
      this.computeHilbertCoordinates();
    },
    computeHilbertCoordinates() {
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
    },
  },
  computed: {
    overview_index() {
      return this.$store.state.overview_index;
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
};
</script>
