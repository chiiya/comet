<template>
  <div class="flex-shrink-0 pt-3">
    <trial-parameter v-for="param in params" :key="`${param.location}-${param.name}`" :parameter="param" v-model="values[param.location][param.name]"></trial-parameter>
    <button @click="send" class="block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded px-4 py-2 text-sm shadow-md">Send</button>
    <div v-show="result">
      <div class="shadow-md rounded-lg mt-4">
        <div class="bg-gray-300 w-full pt-1 px-3 flex">
          <div class="py-2 uppercase font-bold text-gray-600 text-tiny h-full mr-4">Response</div>
        </div>
        <div class="w-full">
          <prism class="border-none bg-gray-100 h-96 overflow-scroll theme-light" language="json">{{ result }}</prism>
        </div>
      </div>
    </div>  
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { DocOperation, Parameter, Dict } from '@comet-cli/types';
import 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-json.js';
import Prism from 'vue-prism-component';
import { namespace } from "vuex-class";
import TrialParameter from './TrialParameter.vue';
const axios = require('axios');
const urljoin = require('url-join');

const Api = namespace("Api");

@Component({
  name: "trial-tab",
  components: {
    TrialParameter,
    Prism,
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
    let query = '';
    const queryParams = Object.keys(this.values.query);
    if (queryParams.length > 0) {
      query += '?';
      for (const name of queryParams) {
        const param = this.values.query[name];
        if (param !== null) {
          query += `${name}=${param}&`;
        }
      }
      query = query.slice(0, -1);
    }
    const server = this.uris.length > 0 ? this.uris[0] : '';
    url = urljoin(server, url, query);
    try {
      const result = await axios({
        method: this.current.method,
        url: url,
      });
      this.result = result.data;
    } catch (error) {
      console.error(error);
    }
  }
}
</script>
