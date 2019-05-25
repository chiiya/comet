<template>
  <tr class="flex flex-1 flex-col">
    <td class="px-6 pt-4 overflow-x-auto border-0 break-words">
      <div class="w-full flex flex-row">
        <div class="w-1/3">
          <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">{{ this.header.name }}</code>
        </div>
        <div class="w-2/3">
          <code v-if="header.example">{{ this.header.example }}</code>
        </div>
      </div>
      <div class="w-full flex flex-row mt-1">
        <div class="w-1/3">
          <span class="text-gray-600 text-tiny uppercase">{{ this.header.displayName }}</span>
        </div>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { DocHeader } from '@comet-cli/types';

  @Component({
    name: 'header-item',
  })
  export default class HeaderItem extends Vue {
    public name: string = 'header-item';
    @Prop(Object) public readonly header!: DocHeader;
  }
</script>
