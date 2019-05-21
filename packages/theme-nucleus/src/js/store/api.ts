/* tslint:disable:function-name */
import { VuexModule, Module, Mutation } from 'vuex-module-decorators';
import { Groups, Operations, Resources } from '../types/api';

@Module({
  namespaced: true,
})
export default class Api extends VuexModule {
  public name: string = '';
  public description: string = '';
  public resources: Resources = {};
  public resourceIds: string[] = [];
  public operations: Operations = {};
  public groups: Groups = {};
  public groupIds: string[] = [];

  @Mutation
  UPDATE_NAME(name: string) {
    this.name = name;
  }

  @Mutation
  UPDATE_DESCRIPTION(description: string) {
    this.description = description;
  }

  @Mutation
  UPDATE_RESOURCES(resources: Resources) {
    this.resources = resources;
  }

  @Mutation
  UPDATE_RESOURCE_IDS(ids: string[]) {
    this.resourceIds = ids;
  }

  @Mutation
  UPDATE_OPERATIONS(operations: Operations) {
    this.operations = operations;
  }

  @Mutation
  UPDATE_GROUPS(groups: Groups) {
    this.groups = groups;
  }

  @Mutation
  UPDATE_GROUP_IDS(ids: string[]) {
    this.groupIds = ids;
  }

  get resource() {
    return (id: string) => this.resources[id];
  }

  get operation() {
    return (id: string) => this.operations[id];
  }

  get group() {
    return (id: string) => this.groups[id];
  }
}
