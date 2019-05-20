<template>
  <div class="w-full flex">
    <div class="w-6/12 h-full max-w-5xl bg-white shadow-content">
      <article class="flex-auto p-12 xl:max-w-4xl mx-auto relative">
        <section class="w-full relative">
          <h1 id="travel-books-api">{{ name }}</h1>
          <div v-if="description" v-html="description"></div>
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
