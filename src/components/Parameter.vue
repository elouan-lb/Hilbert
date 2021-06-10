<template>
  <div
    class="parameters-section"
    :class="{ active: active, inactive: !active }"
  >
    <div class="parameters-slider-container">
      <input :value="min" @input="updateMin" type="number" />
      <div class="parameter-slider">
        <!-- Change zoom width according to zoom level -->
        <input
          :value="range_value"
          @input="updateValue"
          type="range"
          id="parameter-range"
          name="parameter-range"
          :min="min"
          :max="max"
          step="any"
          v-bind:style="{ '--zoomlevel': overview_zoom * 100 + '%' }"
        />
        <input
          :value="value"
          @input="updateValue"
          type="range"
          id="parameter-value"
          name="parameter-value"
          :min="min"
          :max="max"
          step="any"
        />
      </div>
      <input :value="max" @input="updateMax" type="number" />
    </div>
    <input
      :value="name"
      @input="updateName"
      type="text"
      class="parameter-name"
    />
    <div class="activate-parameter" @click="freezeParameter">
      <img v-if="active" src="../assets/imgs/opened_eye.png"  title="Freeze"/>
      <img v-else src="../assets/imgs/closed_eye.png" title="Unfreeze"/>
    </div>
    <div class="delete-parameter" @click="removeParameter" title="Delete">
      <div class="delete-parameter-cross-1"><div class="delete-parameter-cross-2"></div></div>
    </div>
  </div>
</template>

<script>
import store from "../store/index.js";
import { mapState } from "vuex";

export default {
  name: "Parameter",
  store,
  props: {
    index: Number,
  },
  data: function () {
    return {};
  },
  methods: {
    updateValue(e) {
      /* Update value when changing the range value */
      this.$store.commit("updateParameterValue", {
        index: this.index,
        value: e.target.value,
      });
      this.$store.commit("updateParameterRangeValue", {
        index: this.index,
        range_value: e.target.value,
      });
      this.$store.commit("computeParameterZoomedInterval", this.index);
      this.$store.commit("computeHilbertIndex");
    },
    freezeParameter() {
      this.$store.commit("updateParameterActiveState", {
        index: this.index,
        active: !this.active,
      });
    },
    removeParameter() {
      this.$store.commit("removeParameter", this.index);
    },
    updateMin(e) {
      this.$store.commit("updateParameterMin", {
        index: this.index,
        min: e.target.value,
      });
      this.$store.commit("computeParameterZoomedInterval", this.index);
    },
    updateMax(e) {
      this.$store.commit("updateParameterMax", {
        index: this.index,
        max: e.target.value,
      });
      this.$store.commit("computeParameterZoomedInterval", this.index);
    },
    updateName(e) {
      this.$store.commit("updateParameterName", {
        index: this.index,
        name: e.target.value,
      });
    },
  },
  computed: {
    ...mapState({
      overview_zoom: (state) => state.overview_zoom,
      active(state) {
        return state.parameters.find(p => p.index == this.index).active;
      },
      min(state) {
        return parseFloat(state.parameters.find(p => p.index == this.index).min);
      },
      max(state) {
        return parseFloat(state.parameters.find(p => p.index == this.index).max);
      },
      name(state) {
        return state.parameters.find(p => p.index == this.index).name;
      },
      value(state) {
        return parseFloat(state.parameters.find(p => p.index == this.index).value);
      },
      range_value(state) {
        return parseFloat(state.parameters.find(p => p.index == this.index).range_value);
      },
    }),
  },
  async created() {
    this.$store.dispatch("loadHilbertModule")
  }
};
</script>
