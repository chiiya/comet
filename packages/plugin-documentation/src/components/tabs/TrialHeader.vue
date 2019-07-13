<template>
  <div class="w-full mb-4 flex flex-row">
    <div class="w-1/3">
      <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">{{ this.header.name }}</code>
    </div>
    <div class="w-2/3">
      <v-input :value="value" v-model="value"></v-input>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import {DocHeader} from '@comet-cli/types';
  import Input from '../forms/Input.vue';

  @Component({
    name: 'trial-header',
    components: {
      'v-input': Input,
    },
  })
  export default class TrialHeader extends Vue {
    public name: string = 'trial-header';
    @Prop(String) public readonly value!: string | boolean;
    @Prop(Object) public readonly header!: DocHeader;
  }
</script>
