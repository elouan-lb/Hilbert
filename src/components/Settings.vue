<template>
  <div class="settings section-container">
    <h2>Host destination</h2>
    <input
      type="text"
      id="settings-host"
      name="settings-host"
      v-model="settings_buffer.host"
    />
    <h2>Port</h2>
    <input
      type="number"
      id="settings-port"
      name="settings-port"
      v-model="settings_buffer.port"
    />
    <p id="settings-save" @click="save_settings">Save</p>
    <div id="error_message-container" v-show="error_message">
      <p>{{ error_message }}</p>
    </div>
    <div id="validation_message-container" v-show="validation_message">
      <p>{{ validation_message }}</p>
    </div>
  </div>
</template>

<script>
import store from "../store/index.js";

export default {
  name: "Settings",
  store,
  data: function () {
    return {
      settings_buffer: {},
      error_message: "",
      validation_message: "",
    };
  },
  watch: {
    settings_buffer: {
      handler() {
        /* Reset validation messages on input */
        this.error_message = "";
        this.validation_message = "";
      },
      deep: true,
    },
  },
  methods: {
    save_settings() {
      /* Data verifications  TODO: add verifications and OSC connection test */
      if (this.settings_buffer.port > 8000) {
        this.error_message = "Error, invalid port (must be inferior to 8000)";
        return;
      }
      /* Commit settings to store */
      store.commit("updateSettings", this.settings_buffer);
      this.validation_message = "Modifications saved.";
    },
  },
  mounted: function () {
    /* Retrieve stored data */
    this.settings_buffer = this.$store.state.settings;
  },
};
</script>
