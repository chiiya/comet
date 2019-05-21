<template>
  <div>
    <group-section v-for="id in groupIds" :key="id" :id="id"></group-section>
    <resource-section v-for="id in resourceIds" :key="id" :id="id" :in-group="false"></resource-section>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from "vue-property-decorator";
  import GroupSection from './GroupSection.vue';
  import ResourceSection from './ResourceSection.vue';
  import { namespace } from 'vuex-class';

  const Api = namespace('Api');

  @Component({
    components: {
      GroupSection,
      ResourceSection,
    },
  })
  export default class ResourceList extends Vue {
    @Api.State
    private resourceIds!: string[];
    @Api.State
    private groupIds!: string[];
  }
</script>
