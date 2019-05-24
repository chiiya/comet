<template>
  <div :id="current.link" class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 pb-0 xl:max-w-4xl mx-auto">
          <section class="w-full">
            <heading :level="depth">{{ current.name }}</heading>
            <div v-if="current.description" class="content-md" v-html="current.description"></div>
          </section>
        </article>
      </div>
    </div>
    <group-section v-for="id in groupIds" :key="id" :id="id" :depth="depth + 1"></group-section>
    <operation-section v-for="id in operationIds" :key="id" :id="id"></operation-section>
    <hr>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { DocGroup } from '@comet-cli/types';
  import OperationSection from './OperationSection.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    components: {
      OperationSection,
    },
  })
  export default class GroupSection extends Vue {
    public name: string = 'group-section';
    @Prop(String) public readonly id!: string;
    @Prop({ default: 2, type: Number }) public readonly depth!: number;
    @Api.Getter
    private group!: (id: string) => DocGroup;

    get groupIds(): string[] {
      return this.current.groups;
    }

    get operationIds(): string[] {
      return this.current.operations;
    }

    get current(): DocGroup {
      return this.group(this.id);
    }
  }
</script>
