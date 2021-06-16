<template>
  <span class="increment-button">
    <button
      type="button"
      class="increment-button-minus"
      name="increment-button-minus"
      @click="minus"
      @mousedown="longMinus"
      @mouseleave="stopLongClick"
      @mouseup="stopLongClick"
    >
      -
    </button>
    <input
      type="text"
      name="increment-button-value"
      id="increment-button-value"
      v-bind:value="value"
    />
    <button
      type="button"
      class="increment-button-plus"
      name="increment-button-plus"
      @click="plus"
      @mousedown="longPlus"
      @mouseleave="stopLongClick"
      @mouseup="stopLongClick"
    >
      +
    </button>
  </span>
</template>

<script>
export default {
  props: {
    value: {
      default: 0,
      type: Number,
    },
    min: {
      default: 0,
      type: Number,
    },
    max: {
      default: 99,
      type: Number,
    },
  },

  data() {
    return {
      interval: false,
      newValue: 0,
    };
  },

  methods: {
    plus: function () {
      if (this.max === undefined || this.newValue < this.max) {
        this.newValue++;
        this.$emit("input", this.newValue);
      }
    },
    minus: function () {
      if (this.newValue > this.min) {
        this.newValue--;
        this.$emit("input", this.newValue);
      }
    },
    longPlus: function () {
      if (!this.interval) {
        this.interval = setInterval(() => this.plus(), 200);
      }
    },
    longMinus: function () {
      if (!this.interval) {
        this.interval = setInterval(() => this.minus(), 200);
      }
    },
    stopLongClick: function () {
      clearInterval(this.interval);
      this.interval = false;
    },
    checkInput: function (event) {
      var value = parseInt(event.target.value);
      if (isNaN(value)) {
        this.newValue = this.min;
        this.$emit("input", this.min);
        event.target.value = this.min;
      } else {
        if (value < this.min) {
          this.newValue = this.min;
          this.$emit("input", this.min);
          event.target.value = this.min;
        } else {
          this.newValue = value;
          this.$emit("input", value);
        }
        if (value > this.max) {
          this.newValue = this.max;
          this.$emit("input", this.max);
          event.target.value = this.max;
        } else {
          this.newValue = value;
          this.$emit("input", value);
        }
      }
    },
  },
  created: function () {
    this.newValue = this.parsedValue;
  },
  computed: {
    parsedValue: function () {
      return parseInt(this.value, 10);
    },
  },
  watch: {
    value: function (newValue, oldValue) {
      this.newValue = newValue;
    },
  },
};
</script>

<style>
.increment-button {
  min-width: 70px;
  height: 20px;
}

.increment-button input {
  width: 24px;
  height: 20px;
  text-align: center;
  border-width: 0;
}

.increment-button button {
  width: 20px;
  height: 20px;
  background-color: #f1f1f1;
  color: gray;
  border-width: 1px;
  border-style: solid;
  border-color: #bcbcbc;
  padding: 0;
  border-radius: 20%;
}

.increment-button button:hover {
  background-color: #e6e6e6;
  cursor: pointer;
}

#increment-button-value {
  background-color: transparent;
  pointer-events: none;
}
</style>
