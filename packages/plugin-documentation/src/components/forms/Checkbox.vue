<template>
  <div
    :class="{ 'bg-blue-600 border-blue-600': value }"
    class="w-6 h-6 rounded border border-gray-200 inline-flex justify-center items-center bg-gray-200 cursor-pointer"
    @click="$emit('change', !value)"
  >
    <svg
      class="w-1/2 fill-current text-gray-200"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        d="M504.502,75.496c-9.997-9.998-26.205-9.998-36.204,0L161.594,382.203L43.702,264.311c-9.997-9.998-26.205-9.997-36.204,0
            c-9.998,9.997-9.998,26.205,0,36.203l135.994,135.992c9.994,9.997,26.214,9.99,36.204,0L504.502,111.7
            C514.5,101.703,514.499,85.494,504.502,75.496z"
      ></path>
    </svg>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";

  @Component({
    name: 'v-checkbox',
    model: {
      prop: 'value',
      event: 'change',
    }
  })
  export default class Checkbox extends Vue {
    public name: string = 'v-checkbox';
    @Prop(Boolean) public readonly value!: boolean;
  }
</script>
