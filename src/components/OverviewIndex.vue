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

export default {
  name: "OverviewIndex",
  store,
  data: function () {
    return {};
  },
  methods: {
    updateOverviewIndex(e) {
      this.$store.commit("updateOverviewIndex", parseFloat(e.target.value));
    },
  },
  computed: {
    overview_index() {
      return this.$store.state.overview_index;
    },
  },
};
</script>
