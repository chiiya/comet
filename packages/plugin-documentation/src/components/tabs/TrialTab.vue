<template>
  <div class="flex-shrink-0">
    <trial-parameter v-for="param in params" :key="`${param.location}-${param.name}`" :parameter="param" v-model="values[param.location][param.name]"></trial-parameter>
    <button @click="send" class="block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded px-4 py-2 text-sm shadow-md">Send</button>
    <div v-show="result">
      <pre class="border border-gray-200 bg-gray-100 language-json h-16 overflow-scroll"><code>{{ result }}</code></pre>
    </div>  
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { DocOperation, Parameter, Dict } from "@comet-cli/types";
import { namespace } from "vuex-class";
import TrialParameter from './TrialParameter.vue';
const axios = require('axios');

const Api = namespace("Api");

@Component({
  name: "trial-tab",
  components: {
    TrialParameter,
  },
})
export default class TrialTab extends Vue {
  public name: string = "trial-tab";
  private values: Dict<Dict<string | null>> = {
    path: {},
    query: {},
    cookie: {},
  };
  private result: string | null = null;
  @Prop(String) public readonly operationId!: string;
  @Api.State
  private uris!: string[];
  @Api.Getter
  private operation!: (id: string) => DocOperation;

  get current(): DocOperation {
    return this.operation(this.operationId);
  }

  created() {
    for (const parameter of this.current.parameters) {
      this.values[parameter.location][parameter.name] = null;
    }
  }

  get params(): Parameter[] {
    return this.current.parameters;
  }

  private async send() {
    let url = this.current.uri;
    for (const name of Object.keys(this.values.path)) {
      const param = this.values.path[name];
      if (param !== null) {
        const rgx = new RegExp(`{${name}}`, 'g');
        url = url.replace(rgx, param);
      }
    }
    const server = this.uris.length > 0 ? this.uris[0] : '';
    url = new URL(url, server);
    console.log(url);
    try {
      const result = await axios({
        method: this.current.method,
        url: url,
      });
      this.result = result;
    } catch (error) {
      console.error(error);
    }
  }
}
</script>
