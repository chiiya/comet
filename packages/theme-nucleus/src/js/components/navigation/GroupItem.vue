<template>
  <li class="text-sm mt-2">
    <a :href="`#${group.link}`" class="py-1 leading-loose font-semibold text-gray-750 hover:text-blue-400 nav-item">{{ group.name }}</a>
    <ol v-if="group.groups.length" class="list-none pl-4 text-xs relative">
      <group-item v-for="item in group.groups" :key="item.link" :group="item"></group-item>
    </ol>
    <ol v-if="group.operations.length" class="list-none pl-4 text-xs resource-list relative">
      <operation-item v-for="operation in group.operations" :key="operation.link" :operation="operation"></operation-item>
    </ol>
  </li>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";
  import { NavGroup } from "../../types/api";
  import OperationItem from './OperationItem.vue';

  @Component({
    components: {
      OperationItem,
    }
  })
  export default class GroupItem extends Vue {
    @Prop() group!: NavGroup;
    private name: string = 'group-item';
  }
</script>

<style scoped>
  li > ol {
    @apply hidden;
  }
  li.is-active {
    > a {
      @apply text-blue-500;
    }
    > ol {
      @apply block;
    }
  }
</style>
