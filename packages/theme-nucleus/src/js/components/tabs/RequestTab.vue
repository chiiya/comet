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
  import { Vue, Component, Prop } from "vue-property-decorator";
  import { DocHeader, DocOperation } from "../../types/api";
  import HeaderItem from './HeaderItem.vue';
  import BodyItem from './BodyItem.vue';
  import { getJsonBody } from '@comet-cli/helper-utils';
  import { Body } from "@comet-cli/types";

  @Component({
    components: {
      HeaderItem,
      BodyItem,
    }
  })
  export default class RequestTab extends Vue {
    @Prop() operationId!: string;

    get operation(): DocOperation {
      return this.$store.getters['Api/operation'](this.operationId);
    }

    get headers(): DocHeader[] {
      return this.operation.requestHeaders;
    }

    get body(): Body | undefined {
      if (this.operation.request && this.operation.request.body) {
        return getJsonBody(this.operation.request.body);
      }
      return undefined;
    }
  }
</script>
