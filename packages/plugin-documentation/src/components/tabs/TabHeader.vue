<template>
  <li class="block">
    <a :class="classes" @click="$emit('tab-changed', title)">
      <span class="h-4 w-4 flex items-center justify-center mr-2">
        <i :data-feather="icon"></i>
      </span>
      <span>{{ title }}</span>
    </a>
  </li>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  @Component({
    name: 'tab-header',
  })
  export default class TabHeader extends Vue {
    public name: string = 'tab-header';
    @Prop(String) public readonly title!: string;
    @Prop(String) public readonly icon!: string;
    @Prop(Boolean) public readonly isActive!: boolean;

    get classes(): string {
      let className =
        'flex text-gray-700 hover:text-gray-700 items-center justify-center -mb-px '
      + 'px-4 py-2 align-top rounded-tl rounded-tr border ';
      if (this.isActive) {
        className += 'border-b-transparent border-gray-300 bg-white';
      } else {
        className += 'border-transparent hover:bg-gray-100 hover:border-b-gray-300';
      }
      return className;
    }
  }
</script>
