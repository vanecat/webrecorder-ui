import appData from "./App.vue";

import { PywbData } from "./model.js";

import Vue from "vue/dist/vue.esm.browser";

export function init(data, config = {}) {
  const app = new Vue(appData);

  const pywbData = new PywbData(data);

  app.$set(app, "snapshots", pywbData.snapshots);
  app.$set(app, "currentPeriod", pywbData.timeline);

  app.$set(app, "config", {...app.config, config});

  app.$mount("#app");
}
