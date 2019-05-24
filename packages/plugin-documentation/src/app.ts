import Vue from 'vue';
import { App } from '@comet-cli/theme-nucleus';
import { createStore } from './store';

export function createApp() {
  const store = createStore();
  Vue.config.devtools = true;
  const app = new Vue({
    // the root instance simply renders the App component.
    store,
    render: h => h(App),
  });
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
  Vue.config.devtools = true;
  return { app, store };
}
