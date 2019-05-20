import Vue from 'vue';
import Vuex from 'vuex';
import Api from './api';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    Api,
  },
});
