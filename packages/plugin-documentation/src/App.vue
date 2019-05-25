<template>
  <div id="app" class="h-full flex flex-column lg:flex-row justify-start">
    <navigation-section></navigation-section>
    <div class="w-full">
      <overview></overview>
      <hr>
      <item-list></item-list>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator';
  import NavigationSection from './components/NavigationSection.vue';
  import Overview from './components/Overview.vue';
  import ItemList from './components/ItemList.vue';

  @Component({
    components: {
      NavigationSection,
      Overview,
      ItemList,
    },
  })
  export default class App extends Vue {
  }
</script>
