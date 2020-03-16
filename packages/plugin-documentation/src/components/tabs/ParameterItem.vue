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
      <div class="w-full flex-row mt-1">
        <div class="w-2/3 ml-auto">
          <ul v-if="this.enum.length" class="ml-2 mb-0 list-dash">
            <li class="text-sm pl-3" v-for="value in this.enum"><em>{{ value }}</em></li>
          </ul>
        </div>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { Parameter } from '@comet-cli/types';

  @Component({
    name: 'parameter-item',
  })
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

    get enum(): any[] {
      if (this.parameter.schema && this.parameter.schema.enum) {
        return this.parameter.schema.enum;
      }
      return [];
    }
  }
</script>
