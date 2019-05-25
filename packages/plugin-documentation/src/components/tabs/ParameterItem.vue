<template>
  <tr class="flex flex-1 flex-col">
    <td class="px-6 py-4 overflow-x-auto border-0 break-words">
      <div class="w-full flex flex-row">
        <div class="w-1/3">
          <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">{{ parameter.name }}</code>
        </div>
        <div class="w-2/3">
          <code v-if="parameter.example">{{ parameter.example }}</code>
        </div>
      </div>
      <div class="w-full flex flex-row mt-1">
        <div class="w-1/3">
          <span :class="`${this.color} text-tiny uppercase`"><strong>{{ parameter.location }}</strong></span>
          <span v-if="parameter.displayType" class="text-gray-600 text-tiny uppercase">{{ parameter.displayType }}</span>
          <span v-if="parameter.required" class="text-red-600 text-tiny uppercase">Required</span>
        </div>
        <div class="w-2/3">
          <span>{{ parameter.description }}</span>
        </div>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { Parameter } from '@comet-cli/types';

  @Component
  export default class ParameterItem extends Vue {
    public name: string = 'parameter-item';
    @Prop(Object) public readonly parameter!: Parameter;

    get color(): string {
      switch (this.parameter.location) {
        case 'path':
          return 'text-blue-600';
        case 'query':
          return 'text-purple-600';
        case 'cookie':
          return 'text-teal-600';
        default:
          return 'text-gray-600';
      }
    }
  }
</script>
