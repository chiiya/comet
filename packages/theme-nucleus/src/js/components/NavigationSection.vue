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
  import { Vue, Component } from "vue-property-decorator";
  import GroupItem from './navigation/GroupItem.vue';
  import OperationItem from './navigation/OperationItem.vue';
  import { namespace } from 'vuex-class';
  import { Navigation } from "../types/api";

  const Api = namespace('Api');

  @Component({
    components: {
      GroupItem,
      OperationItem,
    }
  })
  export default class NavigationSection extends Vue {
    @Api.State
    private navigation!: Navigation;
  }
</script>
