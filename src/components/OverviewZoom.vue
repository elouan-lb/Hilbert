<template>
  <div class="overview-zoom">
    <h3 id="detail-title">Sampling range</h3>
    <span>-</span>
    <input
      :value="sampling_range_html"
      @input="updateSamplingRange"
      type="range"
      id="overview-zoom-slider"
      name="overview-zoom-slider"
      ref="zoomref"
      min="0"
      max="1"
      step="any"
    />
    <span>+</span>
  </div>
</template>

<script>
import store from "../store/index.js";

export default {
  name: "OverviewZoom",
  store,
  data: function () {
    return {};
  },
  methods: {
    updateSamplingRange(e) {
      /* Workaround to go from 1 to 0 */
      this.$store.commit("updateSamplingRange", 1 - e.target.value);
      /* Update range values */
      this.$store.commit("updateParametersRanges");
    },
  },
  computed: {
    sampling_range() {
      return this.$store.state.sampling_range;
    },
    sampling_range_html() {
      return 1 - this.sampling_range;
    },
  },
  mounted() {
    this.$refs.zoomref.value = this.sampling_range_html;
  },
};
</script>
