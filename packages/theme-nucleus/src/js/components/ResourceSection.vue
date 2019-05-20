<template>
  <div class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 xl:max-w-4xl mx-auto relative">
          <section class="w-full relative">
            <h2 id="authors">{{ resource.name || resource.path }}</h2>
            <p v-if="resource.description" v-html="resource.description"></p>
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
  import { EnhancedResource } from "../types/api";
  import OperationSection from './OperationSection.vue';

  @Component({
    components: {
      OperationSection,
    }
  })
  export default class ResourceSection extends Vue {
    @Prop() id!: string;
    @Prop() inGroup!: boolean;

    get resource(): EnhancedResource {
      return this.$store.getters['Api/resource'](this.id);
    }
  }
</script>
