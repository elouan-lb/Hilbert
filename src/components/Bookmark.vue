<template>
  <button
    class="bookmark-btn"
    :class="{ active: active }"
    @click="click"
    @dblclick="doubleClick"
  ></button>
</template>

<script>
import store from "../store/index.js";

export default {
  name: "Bookmark",
  store,
  data: function () {
    return {
      active: false,
      saved_state: {} /* Object where current state is bookmarked */,
    };
  },
  methods: {
    click() {
      /* If active, return to bookmark */
      if (this.active) {
        this.$store.commit("resetToBookmark", this.saved_state);
      }
    },
    doubleClick() {
      /* If inactive, save bookmark */
      if (!this.active) {
        this.saved_state = JSON.parse(JSON.stringify(this.current_state));
        this.active = true;
      } else if (this.active) {
        /* If active, delete bookmark */
        this.saved_state = {};
        this.active = false;
      }
    },
  },
  computed: {
    current_state() {
      return {
        overview_zoom: this.$store.state.overview_zoom,
        overview_index: this.$store.state.overview_index,
        parameters: this.$store.state.parameters,
      };
    },
  },
};
</script>
