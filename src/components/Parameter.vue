<template>
  <div
    class="parameters-section"
    :class="{ active: active, inactive: !active }"
  >
    <div class="activate-parameter" @click="freezeParameter">
      <img v-if="active" src="../assets/imgs/opened_lock.png" title="Lock" />
      <img v-else src="../assets/imgs/closed_lock.png" title="Unlock" />
    </div>

    <input
      :value="name"
      @input="updateName"
      type="text"
      class="parameter-name"
    />
    <div class="parameters-slider-container">
      <input :value="min" @input="updateMin" type="number" />
      <div class="parameter-slider">
        <!-- Change zoom width according to zoom level -->
        <input
          :value="range_value"
          @input="updateValue"
          type="range"
          id="parameter-range"
          ref="rangeref"
          name="parameter-range"
          :min="min"
          :max="max"
          step="any"
          v-bind:style="{ '--zoomlevel': sampling_range * 100 + '%' }"
        />
        <input
          :value="value"
          @input="updateValue"
          type="range"
          id="parameter-value"
          ref="valueref"
          name="parameter-value"
          :min="min"
          :max="max"
          step="any"
        />
      </div>
      <input :value="max" @input="updateMax" type="number" />
    </div>
    <div class="delete-parameter" @click="removeParameter" title="Delete">
      <div class="delete-parameter-cross-1">
        <div class="delete-parameter-cross-2"></div>
      </div>
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
      sampling_range: (state) => state.sampling_range,
      active(state) {
        return state.parameters[this.index].active;
      },
      min(state) {
        return parseFloat(state.parameters[this.index].min);
      },
      max(state) {
        return parseFloat(state.parameters[this.index].max);
      },
      name(state) {
        return state.parameters[this.index].name;
      },
      value(state) {
        return parseFloat(state.parameters[this.index].value);
      },
      range_value(state) {
        return parseFloat(state.parameters[this.index].range_value);
      },
    }),
  },
  async created() {
    this.$store.dispatch("loadHilbertModule");
  },
  mounted() {
    /* Workaround to initialise DOM values */
    this.$refs.valueref.value = this.value;
    this.$refs.rangeref.value = this.range_value;
  },
};
</script>
