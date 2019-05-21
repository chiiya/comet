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
          <div class="flex flex-shrink-0 items-stretch justify-between overflow-y-hidden overflow-x-auto whitespace-no-wrap mt-12">
            <ul class="flex items-center border-b border-gray-300 flex-grow flex-shrink-0 justify-start">
              <li class="block">
                <a class="flex hover:text-gray-700 text-gray-700 items-center justify-center -mb-px px-4 py-2 align-top rounded-tl rounded-tr border border-b-transparent border-gray-300 bg-white">
                    <span class="h-4 w-4 flex items-center justify-center mr-2">
                      <i data-feather="list"></i>
                    </span>
                  <span>Parameters</span>
                </a>
              </li>
              <li class="block">
                <a class="flex text-gray-700 hover:bg-gray-100 hover:border-b-gray-300 hover:text-gray-700 items-center justify-center -mb-px px-4 py-2 align-top rounded-tl rounded-tr border border-transparent">
                    <span class="h-4 w-4 flex items-center justify-center mr-2">
                      <i data-feather="send"></i>
                    </span>
                  <span>Request</span>
                </a>
              </li>
              <li class="block">
                <a class="flex text-gray-700 hover:bg-gray-100 hover:border-b-gray-300 hover:text-gray-700 items-center justify-center -mb-px px-4 py-2 align-top rounded-tl rounded-tr border border-transparent">
                    <span class="h-4 w-4 flex items-center justify-center mr-2">
                      <i data-feather="server"></i>
                    </span>
                  <span>Response</span>
                </a>
              </li>
              <li class="block">
                <a class="flex text-gray-700 hover:bg-gray-100 hover:border-b-gray-300 hover:text-gray-700 items-center justify-center -mb-px px-4 py-2 align-top rounded-tl rounded-tr border border-transparent">
                    <span class="h-4 w-4 flex items-center justify-center mr-2">
                      <i data-feather="play"></i>
                    </span>
                  <span>Try it out</span>
                </a>
              </li>
            </ul>
          </div>
          <section class="relative overflow-visible flex flex-col">
            <div class="flex-shrink-0">
              <table class="min-w-full border-collapse border border-gray-300">
                <thead class="bg-gray-100 text-left">
                <tr class="flex flex-1 flex-col border-b border-gray-300">
                  <th class="py-3 px-6 border-0">Parameter</th>
                </tr>
                </thead>
                <tbody class="align-top">
                <tr class="flex flex-1 flex-col">
                  <td class="px-6 py-4 overflow-x-auto border-0 break-words">
                    <div class="w-full flex flex-row">
                      <div class="w-1/3">
                        <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">id</code>
                      </div>
                      <div class="w-2/3">
                        <code>1</code>
                      </div>
                    </div>
                    <div class="w-full flex flex-row mt-1">
                      <div class="w-1/3">
                        <span class="text-blue-600 text-tiny uppercase"><strong>Path</strong></span>
                        <span class="text-gray-600 text-tiny uppercase">number</span>
                        <span class="text-red-600 text-tiny uppercase">Required</span>
                      </div>
                      <div class="w-2/3">
                        <span>ID of the author</span>
                      </div>
                    </div>
                  </td>
                  <!--                    <td class="p-6 pb-0 overflow-x-auto border-0 break-words">-->
                  <!--                      <code class="bg-blue-900 rounded text-sm py-1 px-2 text-white inline-block">id</code>-->
                  <!--                      <div class="mt-4">-->
                  <!--                        <span class="py-1 px-3 bg-blue-200 text-gray-700 text-tiny uppercase rounded">Path</span>-->
                  <!--                        <span class="py-1 px-3 bg-gray-200 text-gray-700 text-tiny uppercase rounded">number</span>-->
                  <!--                        <span class="py-1 px-3 bg-red-200 text-gray-700 text-tiny uppercase rounded">Required</span>-->
                  <!--                      </div>-->
                  <!--                    </td>-->
                  <!--                    <td class="px-6 pt-4 overflow-x-auto border-0 break-words">-->
                  <!--                      <p>ID of the author</p>-->
                  <!--                      <p>Example: <code>1</code></p>-->
                  <!--                    </td>-->
                </tr>
                <tr class="flex flex-1 flex-col border-t border-gray-300">
                  <td class="px-6 py-4 overflow-x-auto border-0 break-words">
                    <div class="w-full flex flex-row">
                      <div class="w-1/3">
                        <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">include</code>
                      </div>
                      <div class="w-2/3">
                        <code>books,country</code>
                      </div>
                    </div>
                    <div class="w-full flex flex-row mt-1">
                      <div class="w-1/3">
                        <span class="text-purple-600 text-tiny uppercase"><strong>Query</strong></span>
                        <span class="text-gray-600 text-tiny uppercase">array of strings</span>
                      </div>
                      <div class="w-2/3">
                        <span>Comma-separated list of relationships to include</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr class="flex flex-1 flex-col border-t border-gray-300">
                  <td class="px-6 py-4 overflow-x-auto border-0 break-words">
                    <div class="w-full flex flex-row">
                      <div class="w-1/3">
                        <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">filter[name]</code>
                      </div>
                      <div class="w-2/3">
                        <code>Tony</code>
                      </div>
                    </div>
                    <div class="w-full flex flex-row mt-1">
                      <div class="w-1/3">
                        <span class="text-purple-600 text-tiny uppercase"><strong>Query</strong></span>
                        <span class="text-gray-600 text-tiny uppercase">string</span>
                      </div>
                      <div class="w-2/3">
                        <span>Filter by author name (first name and/or last name)</span>
                      </div>
                    </div>
                    <!--                      <code class="bg-blue-900 rounded text-sm py-1 px-2 text-white inline-block">filter[name]</code>-->
                    <!--                      <div class="mt-4">-->
                    <!--                        <span class="py-1 px-3 bg-purple-200 text-gray-700 text-tiny uppercase rounded">Query</span>-->
                    <!--                        <span class="py-1 px-3 bg-gray-200 text-gray-700 text-tiny uppercase rounded">string</span>-->
                    <!--                      </div>-->
                  </td>
                  <!--                    <td class="px-6 pt-4 overflow-x-auto border-0 break-words">-->
                  <!--                      <p>Filter by author name (first name and/or last name)</p>-->
                  <!--                      <p>Example: <code>Tony</code></p>-->
                  <!--                    </td>-->
                </tr>
                </tbody>
              </table>
            </div>
          </section>
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

  @Component({
    components: {
      CodeSample,
      RequestSample,
      ResponseSample,
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
