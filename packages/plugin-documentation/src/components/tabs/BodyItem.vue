<template>
  <div class="w-full">
    <div v-if="isRoot" class="w-full flex flex-row text-sm">
      <div class="w-1/3">
        <span class="font-mono italic text-gray-700">{{ this.displayName }}</span>
      </div>
    </div>
    <div v-else class="w-full flex flex-row text-sm mt-3">
      <div class="w-1/3">
        <strong class="font-mono block">{{ this.propertyName }}</strong>
        <div class="mt-1">
          <span class="text-gray-600 text-tiny uppercase">{{ this.displayName }}</span>
          <span v-if="schema.format">
            <span class="text-gray-500">–</span>
            <span class="text-gray-600 text-tiny uppercase">{{ this.schema.format }}</span>
          </span>
          <span v-if="required" class="text-red-600 text-tiny uppercase">Required</span>
        </div>
      </div>
      <div class="w-2/3">
        <span v-if="schema['x-circular-ref']" class="text-purple-500">Circular Reference</span>
        {{ this.schema.description }}
      </div>
    </div>
    <div v-if="this.items.length" :class="`ml-${3 + depth}`">
      <body-item v-for="item in this.items" :key="item.id" :schema="item" :property-name="item.name" :required="item.isRequired" :depth="depth + 1"></body-item>
    </div>
    <div v-if="schema && schema.anyOf && schema.anyOf.length" :class="`ml-${3 + depth}`">
      <span class="block mb-3 text-gray-600 text-tiny uppercase font-bold">Any of</span>
      <div v-for="(val, index) in schema.anyOf">
        <span v-if="index !== 0" class="block my-3 text-gray-600 text-tiny uppercase font-bold">Or</span>
        <body-item :schema="val" :is-root="true" :depth="depth + 1"></body-item>
      </div>
    </div>
    <div v-if="schema && schema.oneOf && schema.oneOf.length" :class="`ml-${3 + depth}`">
      <span class="block mb-3 text-gray-600 text-tiny uppercase font-bold">One of</span>
      <div v-for="(val, index) in schema.oneOf">
        <span v-if="index !== 0" class="block my-3 text-gray-600 text-tiny uppercase font-bold">Or</span>
        <body-item :schema="val" :is-root="true" :depth="depth + 1"></body-item>
      </div>
    </div>
    <ul v-if="this.enum.length" :class="`ml-${5 + depth} mt-1 list-dash`">
      <li class="text-sm pl-3" v-for="value in this.enum"><em>{{ value }}</em></li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import { Schema } from '@comet-cli/types';
  import { getHumanReadableType } from '@comet-cli/helper-utils';

  interface ItemSchema extends Schema {
    id?: number;
    isRequired?: boolean;
    name?: string;
  }

  @Component({
    name: 'body-item',
  })
  export default class BodyItem extends Vue {
    public name: string = 'body-item';
    @Prop(Object) public readonly schema!: Schema | undefined;
    @Prop({ default: false, type: Boolean }) public readonly isRoot!: boolean;
    @Prop(String) public readonly propertyName: string | undefined;
    @Prop({ default: false, type: Boolean }) public readonly required!: boolean;
    @Prop({ default: 0, type: Number }) public readonly depth!: number;

    get displayName() {
      return getHumanReadableType(this.schema);
    }

    get enum(): any[] {
      if (this.schema && this.schema.enum) {
        return this.schema.enum;
      }
      return [];
    }

    get items(): ItemSchema[] {
      if (this.schema) {
        return this.getItems(this.schema);
      }
      return [];
    }

    private getItems(schema: Schema): ItemSchema[] {
      if (schema.type === undefined) {
        return [];
      }
      if (schema.type.includes('object') && schema.properties) {
        const items: ItemSchema[] = [];
        let num = 0;
        const properties = Object.keys(schema.properties);
        for (const name of properties) {
          const property = schema.properties[name];
          items.push({
            ...property,
            name,
            id: num++,
            isRequired: schema.required && schema.required.includes(name),
          });
        }
        return items;
      }
      if (schema.type.includes('array') && schema.items) {
        return this.getItems(schema.items);
      }

      return [];
    }
  }
</script>
