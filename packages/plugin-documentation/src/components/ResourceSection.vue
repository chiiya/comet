<template>
  <div :id="current.link" class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 xl:max-w-4xl mx-auto">
          <section class="w-full">
            <h2>{{ current.name || current.path }}</h2>
            <div v-if="current.description" class="content-md" v-html="current.description"></div>
          </section>
        </article>
      </div>
    </div>
    <operation-section v-for="operationId in current.operations" :key="operationId" :resourceId="id" :operationId="operationId"></operation-section>
    <hr v-if="!inGroup">
  </div>

</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { DocResource } from '@comet-cli/types';
  import OperationSection from './OperationSection.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    name: 'resource-section',
    components: {
      OperationSection,
    },
  })
  export default class ResourceSection extends Vue {
    public name: string = 'resource-section';
    @Prop(String) public readonly id!: string;
    @Prop(Boolean) public readonly inGroup!: boolean;
    @Api.Getter
    private resource!: (id: string) => DocResource;

    get current(): DocResource {
      return this.resource(this.id);
    }
  }
</script>
