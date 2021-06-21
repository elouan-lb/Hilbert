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
        :class="{disabled:!renaming}"
        @input="editName"
      />
    <span class="snapshot-btn-ctrls" >
      <img
        class="snapshot-load-icon"
        v-show="hovered"
        src="../assets/imgs/rename.png"
        title="Rename this snapshot"
        @click="renameSnapshot"
      />
      <img
        class="snapshot-trash-icon"
        v-show="hovered"
        src="../assets/imgs/delete.png"
        title="Delete this snapshot"
        @click="deleteSnapshot"
      />
    </span>
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
    return {
      hovered: false,
      renaming: false,
    };
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  methods: {
    select() {
      this.$store.commit("selectSnapshot", this.index);
      this.hovered = true;
    },
    unselect(e) {
      this.$store.commit("unselectSnapshot", this.index);
      this.hovered = false;
      this.renaming = false;
    },
    load() {
      this.$store.commit("loadSnapshot", this.index);
    },
    renameSnapshot() {
      this.renaming = true;
      this.$refs.snapshotname.select()
    },
    deleteSnapshot() {
      this.$store.commit("unselectSnapshot", this.index);
      this.$store.commit("deleteSnapshot", this.index);
    },
    editName(e) {
      this.$store.commit("renameSnapshot", {index: this.index, name: e.target.value});
    }
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
