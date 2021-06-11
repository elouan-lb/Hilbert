<template>
  <button
    class="bookmark-btn active"
    :class="{ selected: selected }"
    ref="bookmarkname"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <div class="bookmark-btn-content">
      <input
        type="text"
        ref="bookmarkname"
        class="bookmark-name"
        value="New bookmark"
      />
      <img
        class="bookmark-load-icon"
        src="../assets/imgs/load_icon.png"
        title="Load this bookmark"
      />
      <img
        class="bookmark-trash-icon"
        src="../assets/imgs/trash_icon.png"
        title="Delete this bookmark"
      />
    </div>
  </button>
</template>

<script>
import store from "../store/index.js";

export default {
  name: "Bookmark",
  store,
  props: ["index"],
  data: function () {
    return {
      saved_state: {} /* Object where current state is bookmarked */,
    };
  },
  methods: {
    select() {
      this.$refs.bookmarkname.select();
    },
    mouseover() {
      /* If active, return to bookmark */
      if (this.active) {
        this.$store.commit("resetToBookmark", this.saved_state);
      }
      this.$store.commit("mouseoverBookmark", this.index);
    },
    mouseleave() {
      this.$store.commit("mouseleaveBookmark", this.index);
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
    selected() {
      return this.$store.state.bookmarks[this.index].selected;
    },
  },
};
</script>
