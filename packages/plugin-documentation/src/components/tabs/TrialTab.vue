<template>
  <div class="flex-shrink-0 pt-3">
    <div v-if="headers.length">
      <h4>Headers</h4>
      <trial-header v-for="header in this.headers" :key="header.name" :header="header" v-model="values.headers[header.name]"></trial-header>
    </div>
    <div v-if="params.length">
      <h4>Parameters</h4>
      <trial-parameter v-for="param in params" :key="`${param.location}-${param.name}`" :parameter="param" v-model="values[param.location][param.name]"></trial-parameter>
    </div>
    <div v-if="hasBody">
      <h4>Body</h4>
      <resizable-textarea>
        <textarea v-model="body" class="form-textarea w-full bg-gray-200 border-2 border-gray-200 text-gray-700"></textarea>
      </resizable-textarea>
    </div>
    <button @click="sendRequest" class="block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded px-4 py-2 text-sm shadow-md">Send</button>
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
import {DocOperation, Parameter, Dict, DocHeader} from '@comet-cli/types';
import 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-json.js';
import Prism from 'vue-prism-component';
import { namespace } from "vuex-class";
import TrialParameter from './TrialParameter.vue';
import TrialHeader from './TrialHeader.vue';
import ResizableTextarea from '../forms/ResizableTextarea';
import {AxiosRequestConfig, Method} from 'axios';
const axios = require('axios');
const urljoin = require('url-join');

const Api = namespace("Api");

interface Values {
  headers: Dict<string | null>;
  path: Dict<string | null>;
  query: Dict<string | null>;
  cookie: Dict<string | null>;
}

@Component({
  name: "trial-tab",
  components: {
    TrialParameter,
    ResizableTextarea,
    TrialHeader,
    Prism,
  },
})
export default class TrialTab extends Vue {
  public name: string = "trial-tab";
  private values: Values = {
    headers: {},
    path: {},
    query: {},
    cookie: {},
  };
  private body: string | null = null;
  private result: string | null = null;
  @Prop(String) public readonly operationId!: string;
  @Api.State
  private uris!: string[];
  @Api.State
  private quasar!: string | null;
  @Api.Getter
  private operation!: (id: string) => DocOperation;

  get current(): DocOperation {
    return this.operation(this.operationId);
  }

  created() {
    for (const parameter of this.current.parameters) {
      this.values[parameter.location][parameter.name] = null;
    }
    for (const header of this.current.requestHeaders) {
      this.values.headers[header.name] = null;
    }
    if (this.hasBody && this.current.exampleRequest) {
      this.body = this.current.exampleRequest.example;
    }
  }

  get headers(): DocHeader[] {
    return this.current.requestHeaders;
  }

  get params(): Parameter[] {
    return this.current.parameters;
  }

  get hasBody(): boolean {
    return ['POST', 'PATCH', 'PUT'].includes(this.current.method);
  }

  private async sendRequest() {
    const uri = this.buildRequestUri();
    let options: AxiosRequestConfig = {};
    if (this.quasar !== null) {
      options = {
        method: 'POST',
        url: urljoin(this.quasar, '/api/request'),
        data: {
          uri: uri,
          headers: this.values.headers,
          body: this.body,
        }
      };
    } else {
      options = {
        url: uri,
        method: <Method>this.current.method,
        headers: this.values.headers,
      };
      if (this.body !== null) {
        options.data = this.body;
      }
    }

    try {
      const result = await axios(options);
      this.result = result.data;
    } catch (error) {
      console.error(error);
    }
  }

  private buildRequestUri() {
    let url = this.current.uri;
    // Replace path parameters
    for (const name of Object.keys(this.values.path)) {
      const param = this.values.path[name];
      if (param !== null) {
        const rgx = new RegExp(`{${name}}`, 'g');
        url = url.replace(rgx, param);
      }
    }
    let query = '';
    const queryParams = Object.keys(this.values.query);
    // Append query parameters
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
    return urljoin(server, url, query);
  }
}
</script>
