import Vue from 'vue';
import Overview from './components/Overview.vue';
import ResourceList from './components/ResourceList.vue';
import store from './store';
import Transformer from './transformer';
const feather = require('feather-icons');

const api = Transformer.execute();
store.commit('Api/UPDATE_NAME', api.name);
store.commit('Api/UPDATE_DESCRIPTION', api.description);
store.commit('Api/UPDATE_RESOURCES', api.resources);
store.commit('Api/UPDATE_RESOURCE_IDS', api.resourceIds);
store.commit('Api/UPDATE_OPERATIONS', api.operations);
store.commit('Api/UPDATE_GROUPS', api.groups);
store.commit('Api/UPDATE_GROUP_IDS', api.groupIds);

const app = new Vue({
  store,
  el: '#app',
  components: { Overview, ResourceList },
});

feather.replace();
