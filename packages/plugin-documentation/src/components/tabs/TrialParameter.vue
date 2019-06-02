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
      <input
        :value="value"
        @input="$emit('input', $event.target.value)"
        :name="parameter.name"
        class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:width-2/4 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Parameter } from "@comet-cli/types";
import { namespace } from "vuex-class";

const Api = namespace("Api");

@Component({
  name: "trial-parameter"
})
export default class TrialParameter extends Vue {
  public name: string = "trial-parameter";
  @Prop(String) public readonly value!: string;
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
}
</script>
