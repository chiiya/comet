<template>
  <li :class="`font-normal mt-1 ${isRoot ? 'pr-3' : 'px-3'} item-operation`">
    <a :href="`#${operation.link}`" class="text-gray-750 hover:text-blue-400 inline-block py-1 nav-item relative">
      <span :class="`w-12 uppercase text-tiny mr-2 ${this.color} font-black inline-block`">{{ operation.method }}</span>{{ operation.name }}
    </a>
  </li>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { NavOperation } from '@comet-cli/types';

  @Component({
    name: 'group-item',
  })
  export default class GroupItem extends Vue {
    public name: string = 'group-item';
    @Prop(Object) public readonly operation!: NavOperation;
    @Prop({ type: Boolean, default: false }) public readonly isRoot!: boolean;

    get color() {
      switch (this.operation.method.toUpperCase()) {
        case 'GET':
          return 'text-green-500';
        case 'POST':
          return 'text-orange-500';
        case 'PUT':
        case 'PATCH':
          return 'text-blue-500';
        case 'DELETE':
          return 'text-red-500';
        default:
          return 'text-gray-500';
      }
    }
  }
</script>
