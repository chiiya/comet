import Vue from 'vue';
import NavigationSection from './components/NavigationSection.vue';
import Overview from './components/Overview.vue';
import ItemList from './components/ItemList.vue';
import store from './store';
import Transformer from './transformer';
const throttle = require('lodash.throttle');

const api = Transformer.execute();
store.commit('Api/UPDATE_NAME', api.name);
store.commit('Api/UPDATE_DESCRIPTION', api.description);
store.commit('Api/UPDATE_GROUPS', api.groups);
store.commit('Api/UPDATE_GROUP_IDS', api.groupIds);
store.commit('Api/UPDATE_OPERATIONS', api.operations);
store.commit('Api/UPDATE_OPERATION_IDS', api.operationIds);
store.commit('Api/UPDATE_NAVIGATION', api.navigation);

Vue.component('heading', {
  render: function (createElement) {
    return createElement(
      // @ts-ignore
      // tslint:disable-next-line:prefer-template
      `h${this.level > 6 ? 6 : this.level}`,
      this.$slots.default,
    );
  },
  props: {
    level: {
      type: Number,
      required: true,
    },
  },
});

const app = new Vue({
  store,
  el: '#app',
  components: { NavigationSection, Overview, ItemList },
});

const mainNavLinks = <NodeListOf<HTMLAnchorElement>>document.querySelectorAll('.nav-item');

const updateNavStatus = () => {
  const fromTop = window.scrollY;

  mainNavLinks.forEach((link) => {
    const section = <HTMLElement>document.querySelector(link.hash);
    const parent = link.parentElement;

    if (section && (section.offsetTop - 1) <= fromTop && (section.offsetTop + section.offsetHeight - 1) > fromTop) {
      if (parent) {
        parent.classList.add('is-active');
      }
    } else {
      if (parent) {
        parent.classList.remove('is-active');
      }
    }
  });
};

window.addEventListener('scroll', throttle(() => {
  updateNavStatus();
},                                         100));
