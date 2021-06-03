<template>
  <div class="overview-zoom">
    <span>-</span>
    <input
      :value="overview_zoom_html"
      @input="updateOverviewZoom"
      type="range"
      id="overview-zoom-slider"
      name="overview-zoom-slider"
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
};
</script>
