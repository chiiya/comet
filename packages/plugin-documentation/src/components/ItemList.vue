<template>
  <div>
    <group-section v-for="id in groupIds" :key="id" :id="id"></group-section>
    <operation-section v-for="id in operationIds" :key="id" :id="id"></operation-section>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator';
  import GroupSection from './GroupSection.vue';
  import OperationSection from './OperationSection.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    name: 'item-list',
    components: {
      GroupSection,
      OperationSection,
    },
  })
  export default class ItemList extends Vue {
    public name: string = 'item-list';
    @Api.State
    private groupIds!: string[];
    @Api.State
    private operationIds!: string[];
  }
</script>
