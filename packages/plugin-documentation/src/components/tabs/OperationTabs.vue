<template>
  <div>
    <div class="flex flex-shrink-0 items-stretch justify-between overflow-y-hidden overflow-x-auto whitespace-no-wrap mt-12">
      <ul class="flex items-center border-b border-gray-300 flex-grow flex-shrink-0 justify-start">
        <tab-header title="Parameters" icon="ListIcon" :is-active="activeTab === 'Parameters'" v-on:tab-changed="changeTab"></tab-header>
        <tab-header title="Request" icon="SendIcon" :is-active="activeTab === 'Request'" v-on:tab-changed="changeTab"></tab-header>
        <tab-header title="Response" icon="ServerIcon" :is-active="activeTab === 'Response'" v-on:tab-changed="changeTab"></tab-header>
<!--        <tab-header title="Try it out" icon="PlayIcon" :is-active="activeTab === 'Try it out'" v-on:tab-changed="changeTab"></tab-header>-->
      </ul>
    </div>
    <section class="overflow-visible flex flex-col">
      <parameters v-show="activeTab === 'Parameters'" :operation-id="operationId"></parameters>
      <request-tab v-show="activeTab === 'Request'" :operation-id="operationId"></request-tab>
      <response-tab v-show="activeTab === 'Response'" :operation-id="operationId"></response-tab>
<!--      <trial-tab v-show="activeTab === 'Try it out'" :operation-id="operationId"></trial-tab>-->
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import TabHeader from './TabHeader.vue';
  import Parameters from './Parameters.vue';
  import RequestTab from './RequestTab.vue';
  import ResponseTab from './ResponseTab.vue';
  import TrialTab from './TrialTab.vue';

  @Component({
    name: 'operation-tabs',
    components: {
      TabHeader,
      Parameters,
      RequestTab,
      ResponseTab,
      TrialTab
    },
  })
  export default class OperationTabs extends Vue {
    public name: string = 'operation-tabs';
    @Prop(String) public readonly operationId!: string;
    private activeTab: string = 'Parameters';

    private changeTab(title: string) {
      this.activeTab = title;
    }
  }
</script>
