<template>
  <div :id="current.link" class="w-full flex">
    <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-operation">
      <article class="flex-auto min-h-full px-12 pt-12 pb-32 xl:max-w-4xl mx-auto">
        <section class="w-full">
          <div class="bg-gray-850 w-full p-2 rounded-lg flex items-center mb-4">
            <div :class="this.class">{{ current.method }}</div>
            <div class="text-sm font-mono text-white text-icon">{{ current.uri }}{{ current.name ? ` - ${current.name}` : ''}}</div>
          </div>
          <div v-if="current.description" class="content-md" v-html="current.description"></div>
          <operation-tabs :operation-id="id"></operation-tabs>
        </section>
      </article>
    </div>
    <div class="w-6/12 max-w-4xl p-6 pt-12 pb-32 text-sm">
      <code-sample :snippet="current.snippet"></code-sample>
      <request-sample v-if="current.exampleRequest" :lang="current.exampleRequest.lang" :sample="current.exampleRequest.example"></request-sample>
      <response-sample v-if="current.exampleResponse" :lang="current.exampleResponse.lang" :sample="current.exampleResponse.example"></response-sample>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { DocOperation } from '@comet-cli/types';
  import CodeSample from './CodeSample.vue';
  import RequestSample from './RequestSample.vue';
  import ResponseSample from './ResponseSample.vue';
  import OperationTabs from './tabs/OperationTabs.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    name: 'operation-section',
    components: {
      CodeSample,
      RequestSample,
      ResponseSample,
      OperationTabs,
    },
  })
  export default class OperationSection extends Vue {
    public name: string = 'operation-section';
    @Prop(String) public readonly id!: string;
    @Api.Getter
    private operation!: (id: string) => DocOperation;

    get current(): DocOperation {
      return this.operation(this.id);
    }

    get class(): string {
      return `${this.color} rounded py-1 px-2 uppercase text-white text-xs mr-4`;
    }

    get color(): string {
      switch (this.current.method.toUpperCase()) {
        case 'GET':
          return 'bg-green-500';
        case 'POST':
          return 'bg-orange-500';
        case 'PUT':
        case 'PATCH':
          return 'bg-blue-500';
        case 'DELETE':
          return 'bg-red-500';
        default:
          return 'bg-gray-500';
      }
    }
  }
</script>
