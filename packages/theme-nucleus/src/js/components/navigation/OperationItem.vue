<template>
  <li class="font-normal mt-1 px-3">
    <a :href="`#${operation.link}`" class="text-gray-750 hover:text-blue-400 inline-block py-1 nav-item relative">
      <span :class="`w-12 uppercase text-tiny mr-2 text-${this.color}-500 font-black inline-block`">{{ operation.method }}</span>{{ operation.name }}
    </a>
  </li>
<!--  <li class="font-normal mt-1 px-3 rounded bg-gray-200">-->
<!--    <a :href="`#${operation.link}`" class="text-gray-750 hover:text-blue-400 font-semibold inline-block py-1 resource-active relative">-->
<!--      <span :class="`w-12 uppercase text-tiny mr-2 text-${this.color}-500 font-black inline-block`">{{ operation.method }}</span>{{ operation.name }}-->
<!--    </a>-->
<!--  </li>-->
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";
  import { NavOperation } from "../../types/api";

  @Component
  export default class GroupItem extends Vue {
    @Prop() operation!: NavOperation;

    get color() {
      switch(this.operation.method.toUpperCase()) {
        case 'GET':
          return 'green';
        case 'POST':
          return 'orange';
        case 'PUT':
        case 'PATCH':
          return 'blue';
        case 'DELETE':
          return 'red';
        default:
          return 'gray';
      }
    }
  }
</script>

<style scoped>
  li.is-active {
    @apply rounded;
    @apply bg-gray-200;

    > a {
      @apply font-semibold;
    }
  }
</style>
