<template>
  <div class="w-full flex">
    <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-operation">
      <article class="flex-auto min-h-full px-12 pt-0 pb-32 xl:max-w-4xl mx-auto relative">
        <section class="w-full relative">
          <div :id="operation.link" class="bg-gray-850 w-full p-2 rounded-lg flex items-center mb-4">
            <div :class="this.class">{{ operation.method }}</div>
            <div class="text-sm font-mono text-white text-icon">{{ resource.path }}{{ operation.name ? ` - ${operation.name}` : ''}}</div>
          </div>
          <p v-if="operation.description" v-html="operation.description"></p>
          <operation-tabs :operation-id="operationId"></operation-tabs>
        </section>
      </article>
    </div>
    <div class="w-6/12 max-w-4xl p-6 pt-0 pb-32 text-sm">
      <code-sample :snippet="operation.snippet"></code-sample>
      <request-sample v-if="operation.exampleRequest" :lang="operation.exampleRequest.lang" :sample="operation.exampleRequest.example"></request-sample>
      <response-sample v-if="operation.exampleResponse" :lang="operation.exampleResponse.lang" :sample="operation.exampleResponse.example"></response-sample>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";
  import { DocOperation, DocResource } from "../types/api";
  import CodeSample from './CodeSample.vue';
  import RequestSample from './RequestSample.vue';
  import ResponseSample from './ResponseSample.vue';
  import OperationTabs from './tabs/OperationTabs.vue';

  @Component({
    components: {
      CodeSample,
      RequestSample,
      ResponseSample,
      OperationTabs,
    }
  })
  export default class OperationSection extends Vue {
    @Prop() resourceId!: string;
    @Prop() operationId!: string;

    get resource(): DocResource {
      return this.$store.getters['Api/resource'](this.resourceId);
    }

    get operation(): DocOperation {
      return this.$store.getters['Api/operation'](this.operationId);
    }

    get class(): string {
      return `bg-${this.color}-500 rounded py-1 px-2 uppercase text-white text-xs mr-4`;
    }

    get color(): string {
      switch (this.operation.method.toUpperCase()) {
        case 'GET':
          return 'green';
        case 'POST':
          return 'orange';
        case 'PUT':
        case 'PATCH':
          return 'blue';
        case 'DELETE':
          return 'red';
        default:
          return 'gray';
      }
    }
  }
</script>
