import Vue from 'vue';
import { createApp } from './app';

Vue.config.devtools = true;
const { app, store } = createApp();
console.log('Hello from the client');

// @ts-ignore
if (window.__INITIAL_STATE__) {
  // We initialize the store state with the data injected from the server
  console.log('Replacing state');
  store.registerModule('Api', {
    namespaced: true,
    // @ts-ignore
    state: window.__INITIAL_STATE__['Api'],
  });
  console.log(store.state.Api.name);
}
Vue.config.devtools = true;
// this assumes App.vue template root element has `id="app"`
app.$mount('#app');
