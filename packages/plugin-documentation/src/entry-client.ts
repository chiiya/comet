import Vue from 'vue';
import Prism from 'prismjs';
import { createApp } from './app';

Vue.config.devtools = true;
const { app, store } = createApp();

// @ts-ignore
if (window.__INITIAL_STATE__) {
  // We initialize the store state with the data injected from the server
  store.registerModule('Api', {
    namespaced: true,
    // @ts-ignore
    state: window.__INITIAL_STATE__['Api'],
  });
}
Vue.config.devtools = true;
// this assumes App.vue template root element has `id="app"`
app.$mount('#app');

Prism.highlightAll();
