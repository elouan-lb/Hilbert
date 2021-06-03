<template>
  <div
    class="parameters-section"
    :class="{ active: active, inactive: !active }"
  >
    <div class="parameters-slider-container">
      <input :value="min" @input="updateMin" type="number" />
      <div class="parameter-slider">
        <input
          type="range"
          id="parameter-range"
          name="parameter-range"
          :min="min"
          :max="max"
          step="any"
          value="0"
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
      <img v-if="active" src="../assets/imgs/opened_eye.png" />
      <img v-else src="../assets/imgs/closed_eye.png" />
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
    freezeParameter() {
      this.$store.commit("updateParameterActiveState", {
        index: this.index,
        active: !this.active,
      });
    },
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
        console.log(state.parameters[this.index].value);
        return parseFloat(state.parameters[this.index].value);
      },
    }),
  },
};
</script>
