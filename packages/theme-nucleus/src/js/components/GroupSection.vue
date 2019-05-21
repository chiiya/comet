<template>
  <div class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 xl:max-w-4xl mx-auto relative">
          <section class="w-full relative">
            <h1 :id="group.link">{{ group.name }}</h1>
            <p v-if="group.description" v-html="group.description"></p>
          </section>
        </article>
      </div>
    </div>
    <resource-section v-for="id in ids" :key="id" :id="id" :in-group="true"></resource-section>
    <hr>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";
  import ResourceSection from './ResourceSection.vue';
  import { DocGroup, Resources } from "../types/api";
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    components: {
      ResourceSection,
    },
  })
  export default class GroupSection extends Vue {
    @Prop() id!: string;
    @Api.State
    private resources!: Resources;

    get ids(): string[] {
      return this.group.resources;
    }

    get group(): DocGroup {
      return this.$store.getters['Api/group'](this.id);
    }
  }
</script>
