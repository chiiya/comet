<template>
  <div :id="resource.link" class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 xl:max-w-4xl mx-auto">
          <section class="w-full">
            <h2>{{ resource.name || resource.path }}</h2>
            <div v-if="resource.description" class="content-md" v-html="resource.description"></div>
          </section>
        </article>
      </div>
    </div>
    <operation-section v-for="operationId in resource.operations" :key="operationId" :resourceId="id" :operationId="operationId"></operation-section>
    <hr v-if="!inGroup">
  </div>

</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";
  import { DocResource } from "../types/api";
  import OperationSection from './OperationSection.vue';

  @Component({
    components: {
      OperationSection,
    }
  })
  export default class ResourceSection extends Vue {
    @Prop() id!: string;
    @Prop() inGroup!: boolean;

    get resource(): DocResource {
      return this.$store.getters['Api/resource'](this.id);
    }
  }
</script>
