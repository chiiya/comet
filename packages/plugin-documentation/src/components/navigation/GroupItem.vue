<template>
  <li class="text-sm mt-2 item-group">
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
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { NavGroup } from '@comet-cli/types';
  import OperationItem from './OperationItem.vue';

  @Component({
    components: {
      OperationItem,
    },
  })
  export default class GroupItem extends Vue {
    public name: string = 'group-item';
    @Prop(Object) public readonly group!: NavGroup;
  }
</script>
