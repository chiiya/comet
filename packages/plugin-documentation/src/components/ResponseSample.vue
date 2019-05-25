<template>
  <div class="shadow-md rounded-lg mb-4">
    <div class="bg-gray-850 rounded-tl-lg rounded-tr-lg w-full pt-1 px-3 flex">
      <div class="py-2 uppercase font-bold text-gray-400 text-tiny h-full mr-4">Example Response</div>
    </div>
    <div class="w-full">
      <pre class="border-none rounded-bl-lg rounded-br-lg bg-gray-950"><code :class="`language-${lang} theme-dark`">{{ sample }}</code></pre>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  @Component({
    name: 'response-sample',
  })
  export default class ResponseSample extends Vue {
    public name: string = 'response-sample';
    @Prop(String) public readonly lang!: string;
    @Prop(String) public readonly sample!: string;
  }
</script>
