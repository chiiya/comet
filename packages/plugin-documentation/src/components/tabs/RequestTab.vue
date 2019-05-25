<template>
  <div class="flex-shrink-0">
    <table class="min-w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100 text-left">
      <tr class="flex flex-1 flex-col border-b border-gray-300">
        <th class="py-3 px-6 border-0">Headers</th>
      </tr>
      </thead>
      <tbody class="align-top text-sm">
      <header-item v-for="header in headers" :key="header.name" :header="header"></header-item>
      </tbody>
    </table>
    <table v-if="body" class="min-w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100 text-left">
      <tr class="flex flex-1 flex-col border-b border-gray-300">
        <th class="py-3 px-6 border-0">Body</th>
      </tr>
      </thead>
      <tbody class="align-top">
      <tr class="flex flex-1 flex-col">
        <td class="px-6 pt-4 overflow-x-auto border-0 break-words">
          <body-item :schema="body.schema" :is-root="true"></body-item>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { getJsonBody } from '@comet-cli/helper-utils';
  import { Body, DocHeader, DocOperation } from '@comet-cli/types';
  import HeaderItem from './HeaderItem.vue';
  import BodyItem from './BodyItem.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    components: {
      HeaderItem,
      BodyItem,
    },
  })
  export default class RequestTab extends Vue {
    public name: string = 'request-tab';
    @Prop(String) public readonly operationId!: string;
    @Api.Getter
    private operation!: (id: string) => DocOperation;

    get current(): DocOperation {
      return this.operation(this.operationId);
    }

    get headers(): DocHeader[] {
      return this.current.requestHeaders;
    }

    get body(): Body | undefined {
      if (this.current.request && this.current.request.body) {
        return getJsonBody(this.current.request.body);
      }
      return undefined;
    }
  }
</script>
