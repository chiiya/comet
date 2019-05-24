<template>
  <div class="w-80 flex-shrink-0 relative">
    <!--    <div class="sticky w-64 h-full"></div>-->
    <div class="sticky inset-x-0 top-0 p-8 pt-16 sidebar">
      <ol class="list-none leading-loose relative">
        <li class="text-sm mt-2">
          <a href="#overview" class="py-1 font-semibold text-gray-750 nav-item">Overview</a>
        </li>
        <group-item v-for="group in this.navigation.groups" :key="group.link" :group="group"></group-item>
      </ol>
      <ol v-if="this.navigation.operations.length" class="list-none pl-4 text-xs resource-list relative">
        <operation-item v-for="operation in navigation.operations" :key="operation.link" :operation="operation"></operation-item>
      </ol>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator';
  import { Navigation } from '@comet-cli/types';
  import { namespace } from 'vuex-class';
  import GroupItem from './navigation/GroupItem.vue';
  import OperationItem from './navigation/OperationItem.vue';
  const throttle = require('lodash.throttle');

  const Api = namespace('Api');

  @Component({
    components: {
      GroupItem,
      OperationItem,
    },
  })
  export default class NavigationSection extends Vue {
    public name: string = 'navigation-section';
    @Api.State
    private navigation!: Navigation;

    public beforeMount() {
      const mainNavLinks = <NodeListOf<HTMLAnchorElement>> document.querySelectorAll('.nav-item');

      const updateNavStatus = () => {
        const fromTop = window.scrollY;

        mainNavLinks.forEach((link) => {
          const section = <HTMLElement> document.querySelector(link.hash);
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
      }, 100));
    }
  }
</script>
