<template>
  <button
    class="snapshot-btn"
    :class="{ selected: selected }"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
    @click="mouseclick"
    :title="name"
  >
    <div class="snapshot-btn-content">
      <input
        type="text"
        ref="snapshotname"
        class="snapshot-name"
        :value="name"
      />
    </div>
  </button>
</template>

<script>
import store from "../store/index.js";

export default {
  name: "snapshot",
  store,
  props: ["index"],
  data: function () {
    return {
      saved_state: {},
    };
  },
  methods: {
    mouseclick() {
      this.$store.commit("selectsnapshot", {
        index: this.index,
        state: this.saved_state,
      });
    }
  },
  computed: {
    name() {
      return this.$store.state.snapshots[this.index].name;
    },
    current_state() {
      return {
        parameters_no: this.$store.state.settings.parameters_no,
        overview_zoom: this.$store.state.overview_zoom,
        overview_index: this.$store.state.overview_index,
        parameters: this.$store.state.parameters,
      };
    },
    selected() {
      return this.$store.state.snapshots[this.index].selected;
    },
  },
};
</script>
