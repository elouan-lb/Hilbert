<template>
  <button
    class="snapshot-btn"
    :class="{ selected: selected }"
    @mouseenter="select"
    @mouseleave="unselect"
    @dblclick="load"
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
import vClickOutside from "click-outside-vue3";

export default {
  name: "snapshot",
  store,
  props: ["index"],
  data: function () {
    return {};
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  methods: {
    select() {
      this.$store.commit("selectSnapshot", this.index);
    },
    unselect(event) {
      this.$store.commit("unselectSnapshot", this.index);
    },
    load(event) {
      this.$store.commit("loadSnapshot", this.index);
    },
  },
  computed: {
    name() {
      return this.$store.state.snapshots[this.index].name;
    },
    saved_state() {
      return this.$store.state.snapshots[this.index].saved_state;
    },
    selected() {
      return this.$store.state.snapshots[this.index].selected;
    },
  },
};
</script>
