<template>
  <div>
    <div class="flex flex-shrink-0 items-stretch justify-between overflow-y-hidden overflow-x-auto whitespace-no-wrap mt-12">
      <ul class="flex items-center border-b border-gray-300 flex-grow flex-shrink-0 justify-start">
        <tab-header name="Parameters" icon="list" :is-active="true"></tab-header>
        <tab-header name="Request" icon="send" :is-active="false"></tab-header>
        <tab-header name="Response" icon="server" :is-active="false"></tab-header>
        <tab-header name="Try it out" icon="play" :is-active="false"></tab-header>
      </ul>
    </div>
    <section class="relative overflow-visible flex flex-col">
<!--      <parameters :operation-id="operationId"></parameters>-->
      <request-tab :operation-id="operationId"></request-tab>
    </section>
  </div>
</template>

<script lang="ts">
  const feather = require('feather-icons');
  import { Component, Prop, Vue } from "vue-property-decorator";
  import TabHeader from './TabHeader.vue';
  import Parameters from './Parameters.vue';
  import RequestTab from './RequestTab.vue';

  @Component({
    components: {
      TabHeader,
      Parameters,
      RequestTab,
    }
  })
  export default class OperationSection extends Vue {
    @Prop() operationId!: string;

    mounted() {
      feather.replace();
    }
  }
</script>
