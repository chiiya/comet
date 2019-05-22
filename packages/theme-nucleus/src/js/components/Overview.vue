<template>
  <div class="w-full flex">
    <div class="w-6/12 h-full max-w-5xl bg-white shadow-content">
      <article class="flex-auto p-12 xl:max-w-4xl mx-auto">
        <section class="w-full">
          <h1 id="overview">{{ name }}</h1>
          <div v-if="description" class="content-md" v-html="description"></div>
        </section>
      </article>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from "vue-property-decorator";
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component
  export default class Overview extends Vue {
    @Api.State
    private name!: string;
    @Api.State
    private description!: string;
  }
</script>
