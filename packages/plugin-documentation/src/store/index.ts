import Vue from 'vue';
import Vuex from 'vuex';
import Api from './store';

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    modules: {
      Api,
    },
  });
}
