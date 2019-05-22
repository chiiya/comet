<template>
  <div :id="group.link" class="w-full">
    <div class="w-full flex">
      <div class="w-6/12 min-h-full max-w-5xl bg-white shadow-content">
        <article class="flex-auto min-h-full p-12 pb-0 xl:max-w-4xl mx-auto">
          <section class="w-full">
            <heading :level="depth">{{ group.name }}</heading>
            <div v-if="group.description" class="content-md" v-html="group.description"></div>
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
  import { Vue, Component, Prop } from "vue-property-decorator";
  import OperationSection from './OperationSection.vue';
  import { DocGroup } from "../types/api";
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    components: {
      OperationSection,
    },
  })
  export default class GroupSection extends Vue {
    @Prop() id!: string;
    @Prop({ default: 2 }) depth!: number;
    private name: string = 'group-section';

    get groupIds(): string[] {
      return this.group.groups;
    }

    get operationIds(): string[] {
      return this.group.operations;
    }

    get group(): DocGroup {
      return this.$store.getters['Api/group'](this.id);
    }
  }
</script>
