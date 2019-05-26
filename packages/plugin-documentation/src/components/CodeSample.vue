<template>
  <div class="w-full">
    <div class="bg-gray-850 py-1 w-full flex items-center justify-end">
      <a class="mr-1 text-gray-500 hover:text-gray-100 flex flex-row items-center">
        <span class="text-sm font-mono text-icon">cURL</span>
        <chevron-down-icon class="h-4"></chevron-down-icon>
      </a>
      <a class="mr-1 text-gray-500 hover:text-gray-100 flex items-center"><clipboard-icon class="h-4"></clipboard-icon></a>
      <span class="mr-1 text-gray-500 flex items-center"><code-icon class="h-4"></code-icon></span>
    </div>
    <pre class="border-none bg-gray-950"><code class="language-bash theme-dark">{{ snippet }}</code></pre>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import CodeIcon from 'vue-feather-icons/icons/CodeIcon';
  import ChevronDownIcon from 'vue-feather-icons/icons/ChevronDownIcon';
  import ClipboardIcon from 'vue-feather-icons/icons/ClipboardIcon';

  @Component({
    name: 'code-sample',
    components: {
      CodeIcon,
      ChevronDownIcon,
      ClipboardIcon
    },
  })
  export default class CodeSample extends Vue {
    public name: string = 'code-sample';
    @Prop(String) public readonly snippet!: string;
  }
</script>
