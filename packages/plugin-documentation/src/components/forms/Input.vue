<template>
  <input
    :value="value"
    @input="$emit('input', value)"
    class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:width-2/4 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  >
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";

  @Component({
    name: 'v-input',
  })
  export default class Input extends Vue {
    public name: string = 'v-input';
    @Prop(String) public readonly value!: string;
  }
</script>
