<template>
  <div class="parameters-section active">
    <div class="parameters-slider-container">
      <input
        :value="min"
        @input="updateMin"
        type="number"
        id="parameter-1-min"
        name="parameter-1-min"
      />
      <div class="parameter-slider">
        <input
          type="range"
          id="parameter-range"
          name="parameter-range"
          :min="min"
          :max="max"
          step="0.001"
        />
        <input
          :value="value"
          @input="updateValue"
          type="range"
          id="parameter-value"
          name="parameter-value"
          :min="min"
          :max="max"
          step="0.001"
        />
      </div>
      <input
        :value="max"
        @input="updateMax"
        type="number"
        id="parameter-1-max"
        name="parameter-1-max"
      />
    </div>
    <input
      :value="name"
      @input="updateName"
      type="text"
      class="parameter-name"
      id="parameter-1-name"
      name="parameter-1-name"
    />
    <div class="activate-parameter active"></div>
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
    updateMin(e) {
      this.$store.commit("updateParameterMin", {
        index: this.index,
        min: e.target.value,
      });
    },
    updateMax(e) {
      this.$store.commit("updateParameterMax", {
        index: this.index,
        max: e.target.value,
      });
    },
    updateName(e) {
      this.$store.commit("updateParameterName", {
        index: this.index,
        name: e.target.value,
      });
    },
    updateValue(e) {
      this.$store.commit("updateParameterValue", {
        index: this.index,
        value: e.target.value,
      });
    },
  },
  computed: {
    ...mapState({
      min(state) {
        return state.parameters[this.index].min;
      },
      max(state) {
        return state.parameters[this.index].max;
      },
      name(state) {
        return state.parameters[this.index].name;
      },
      value(state) {
        return state.parameters[this.index].value;
      },
    }),
  },
};
</script>
