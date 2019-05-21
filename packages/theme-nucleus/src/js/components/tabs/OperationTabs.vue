<template>
  <div>
    <div class="flex flex-shrink-0 items-stretch justify-between overflow-y-hidden overflow-x-auto whitespace-no-wrap mt-12">
      <ul class="flex items-center border-b border-gray-300 flex-grow flex-shrink-0 justify-start">
        <tab-header name="Parameters" icon="list" :is-active="activeTab === 'Parameters'" v-on:tab-changed="changeTab"></tab-header>
        <tab-header name="Request" icon="send" :is-active="activeTab === 'Request'" v-on:tab-changed="changeTab"></tab-header>
        <tab-header name="Response" icon="server" :is-active="activeTab === 'Response'" v-on:tab-changed="changeTab"></tab-header>
        <tab-header name="Try it out" icon="play" :is-active="activeTab === 'Try it out'" v-on:tab-changed="changeTab"></tab-header>
      </ul>
    </div>
    <section class="relative overflow-visible flex flex-col">
      <parameters v-show="activeTab === 'Parameters'" :operation-id="operationId"></parameters>
      <request-tab v-show="activeTab === 'Request'" :operation-id="operationId"></request-tab>
      <response-tab v-show="activeTab === 'Response'" :operation-id="operationId"></response-tab>
    </section>
  </div>
</template>

<script lang="ts">
  const feather = require('feather-icons');
  import { Component, Prop, Vue } from "vue-property-decorator";
  import TabHeader from './TabHeader.vue';
  import Parameters from './Parameters.vue';
  import RequestTab from './RequestTab.vue';
  import ResponseTab from './ResponseTab.vue';

  @Component({
    components: {
      TabHeader,
      Parameters,
      RequestTab,
      ResponseTab,
    }
  })
  export default class OperationSection extends Vue {
    @Prop() operationId!: string;
    private activeTab: string = 'Parameters';

    mounted() {
      feather.replace();
    }

    changeTab(name: string) {
      this.activeTab = name;
    }
  }
</script>
