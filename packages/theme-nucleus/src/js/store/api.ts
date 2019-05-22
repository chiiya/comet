/* tslint:disable:function-name */
import { VuexModule, Module, Mutation } from 'vuex-module-decorators';
import { Groups, Navigation, Operations } from '../types/api';

@Module({
  namespaced: true,
})
export default class Api extends VuexModule {
  public name: string = '';
  public description: string = '';
  public groups: Groups = {};
  public groupIds: string[] = [];
  public operations: Operations = {};
  public operationIds: string[] = [];
  public navigation: Navigation = {
    groups: [],
    operations: [],
  };

  @Mutation
  UPDATE_NAME(name: string) {
    this.name = name;
  }

  @Mutation
  UPDATE_DESCRIPTION(description: string) {
    this.description = description;
  }

  @Mutation
  UPDATE_OPERATIONS(operations: Operations) {
    this.operations = operations;
  }

  @Mutation
  UPDATE_OPERATION_IDS(ids: string[]) {
    this.operationIds = ids;
  }

  @Mutation
  UPDATE_GROUPS(groups: Groups) {
    this.groups = groups;
  }

  @Mutation
  UPDATE_GROUP_IDS(ids: string[]) {
    this.groupIds = ids;
  }

  @Mutation
  UPDATE_NAVIGATION(navigation: Navigation) {
    this.navigation = navigation;
  }

  get operation() {
    return (id: string) => this.operations[id];
  }

  get group() {
    return (id: string) => this.groups[id];
  }
}
