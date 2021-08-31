import appData from "./App.vue";

import { PywbData } from "./model.js";

import Vue from "vue/dist/vue.esm.browser";

export function init(config, data) {
  appData.data.config = config;

  data = new PywbData(data);
  appData.data.snapshots = data.snapshots;
  appData.data.currentPeriod = data.timeline;

  const app = new Vue({
    render: (h) => h(appData)
  });

  app.$mount("#app");
}
