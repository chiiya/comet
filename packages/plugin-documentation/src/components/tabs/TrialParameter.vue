<template>
  <div class="w-full mb-4 flex flex-row">
    <div class="w-1/3">
      <code class="bg-gray-200 text-gray-700 rounded py-1 px-2 inline-block">{{ parameter.name }}</code>
      <div class="w-full">
          <span :class="`${this.color} text-tiny uppercase`">
            <strong>{{ parameter.location }}</strong>
          </span>
        <span
          v-if="parameter.displayType"
          class="text-gray-600 text-tiny uppercase"
        >{{ parameter.displayType }}</span>
        <span v-if="parameter.required" class="text-red-600 text-tiny uppercase">Required</span>
      </div>
    </div>
    <div class="w-2/3">
      <v-checkbox v-if="type === 'boolean'" :value="!!value" v-model="value"></v-checkbox>
      <v-select v-else-if="isEnum" :value="value" :options="parameter.schema.enum" v-model="value"></v-select>
      <v-input v-else :value="value" v-model="value"></v-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Parameter } from "@comet-cli/types";
import { namespace } from "vuex-class";
import Checkbox from '../forms/Checkbox.vue';
import Input from '../forms/Input.vue';
import Select from '../forms/Select.vue';

const Api = namespace("Api");

@Component({
  name: "trial-parameter",
  components: {
    'v-checkbox': Checkbox,
    'v-select': Select,
    'v-input': Input,
  },
})
export default class TrialParameter extends Vue {
  public name: string = "trial-parameter";
  @Prop(String) public readonly value!: string | boolean;
  @Prop(Object) public readonly parameter!: Parameter;

  get color(): string {
    switch (this.parameter.location) {
      case "path":
        return "text-blue-600";
      case "query":
        return "text-purple-600";
      case "cookie":
        return "text-teal-600";
      default:
        return "text-gray-600";
    }
  }

  get isEnum(): boolean {
    const schema = this.parameter.schema;
    return (schema !== undefined && schema.enum !== undefined && Array.isArray(schema.enum) && schema.enum.length > 0);
  }

  get type(): string | undefined {
    if (this.parameter.schema && this.parameter.schema.type) {
      if (Array.isArray(this.parameter.schema.type) === false) {
        return <string>this.parameter.schema.type;
      }
    }
  }
}
</script>
