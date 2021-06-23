<template>
  <div class="overview-zoom">
    <h3 id="detail-title">Sampling range</h3>
    <span>-</span>
    <input
      :value="overview_zoom_html"
      @input="updateOverviewZoom"
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
    updateOverviewZoom(e) {
      /* Workaround to go from 1 to 0 */
      this.$store.commit("updateOverviewZoom", 1 - e.target.value);
      /* Update range values */
      this.$store.commit("updateParametersRanges");
    },
  },
  computed: {
    overview_zoom() {
      return this.$store.state.overview_zoom;
    },
    overview_zoom_html() {
      return 1 - this.overview_zoom;
    },
  },
  mounted() {
    this.$refs.zoomref.value = this.overview_zoom_html;
  },
};
</script>
