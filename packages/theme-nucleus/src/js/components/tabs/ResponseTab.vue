<template>
  <div class="flex-shrink-0">
    <div class="w-full flex flex-row mb-4">
      <a
        v-for="(code, index) in statusCodes"
        :key="index"
        :class="`block rounded ${index === activeIndex ? 'bg-blue-700' : 'bg-blue-900'} text-gray-100 hover:text-gray-100 hover:bg-blue-800 text-sm py-1 px-4 mr-2`"
        @click="selectResponse(index)"
        >
        {{ code }}
      </a>
    </div>
    <div class="mb-3" v-html="description"></div>
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
    <table v-if="body && body.schema" class="min-w-full border-collapse border border-gray-300">
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
  import { DocHeader, DocOperation, DocResponses } from "../../types/api";
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
  export default class ResponseTab extends Vue {
    @Prop() operationId!: string;
    private responses: DocResponses | undefined = {};
    private statusCodes: string[] = [];
    private activeIndex: number = 0;

    get operation(): DocOperation {
      return this.$store.getters['Api/operation'](this.operationId);
    }

    get headers(): DocHeader[] {
      if (this.responses === undefined || this.statusCodes.length === 0) {
        return [];
      }
      return this.responses![this.statusCodes[this.activeIndex]].headers;
    }

    get body(): Body | undefined {
      if (this.responses !== undefined && this.statusCodes.length > 0 && this.responses[this.statusCodes[this.activeIndex]].body) {
        return getJsonBody(this.responses[this.statusCodes[this.activeIndex]].body);
      }
      return undefined;
    }

    get description(): string | undefined {
      if (this.responses !== undefined && this.statusCodes.length > 0) {
        return this.responses[this.statusCodes[this.activeIndex]].description;
      }
      return undefined;
    }

    created() {
      this.responses = this.operation.responses;
      this.statusCodes = Object.keys(this.operation.responses || {});
    }

    selectResponse(index: number) {
      if (this.activeIndex === index) return;
      this.activeIndex = index;
    }
  }
</script>
