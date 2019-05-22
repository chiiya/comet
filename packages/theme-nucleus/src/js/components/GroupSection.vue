<template>
  <div :id="group.link" class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 xl:max-w-4xl mx-auto">
          <section class="w-full">
            <h1>{{ group.name }}</h1>
            <div v-if="group.description" class="content-md" v-html="group.description"></div>
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
