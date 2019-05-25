<template>
  <div v-if="parameters.length > 0" class="flex-shrink-0">
    <table class="min-w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100 text-left">
      <tr class="flex flex-1 flex-col border-b border-gray-300">
        <th class="py-3 px-6 border-0">Parameter</th>
      </tr>
      </thead>
      <tbody class="align-top">
      <parameter-item v-for="param in parameters" :key="param.name" :parameter="param"></parameter-item>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { Parameter, DocOperation } from '@comet-cli/types';
  import ParameterItem from './ParameterItem.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    name: 'parameters',
    components: {
      ParameterItem,
    },
  })
  export default class Parameters extends Vue {
    public name: string = 'parameters';
    @Prop(String) public readonly operationId!: string;
    @Api.Getter
    private operation!: (id: string) => DocOperation;

    get current(): DocOperation {
      return this.operation(this.operationId);
    }

    get parameters(): Parameter[] {
      return this.current.parameters;
    }
  }
</script>
