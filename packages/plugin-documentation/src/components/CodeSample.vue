<template>
  <div class="w-full">
    <div class="bg-gray-850 py-1 w-full flex items-center justify-end">
      <a class="mr-1 text-gray-500 hover:text-gray-100 flex flex-row items-center">
        <span class="text-sm font-mono text-icon">cURL</span>
        <i data-feather="chevron-down" class="h-4"></i>
      </a>
      <a class="mr-1 text-gray-500 hover:text-gray-100 flex items-center"><i data-feather="clipboard" class="h-4"></i></a>
      <span class="mr-1 text-gray-500 flex items-center"><i data-feather="code" class="h-4"></i></span>
    </div>
    <pre class="border-none bg-gray-950"><code class="language-bash theme-dark">{{ snippet }}</code></pre>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  @Component({
    name: 'code-sample',
  })
  export default class CodeSample extends Vue {
    public name: string = 'code-sample';
    @Prop(String) public readonly snippet!: string;
  }
</script>
