import CodeSample from './components/CodeSample.vue';
import GroupSection from './components/GroupSection.vue';
import ItemList from './components/ItemList.vue';
import NavigationSection from './components/NavigationSection.vue';
import OperationSection from './components/OperationSection.vue';
import Overview from './components/Overview.vue';
import RequestSample from './components/RequestSample.vue';
import ResourceSection from './components/ResourceSection.vue';
import ResponseSample from './components/ResponseSample.vue';
import GroupItem from './components/navigation/GroupItem.vue';
import OperationItem from './components/navigation/OperationItem.vue';
import BodyItem from './components/tabs/BodyItem.vue';
import HeaderItem from './components/tabs/HeaderItem.vue';
import OperationTabs from './components/tabs/OperationTabs.vue';
import ParameterItem from './components/tabs/ParameterItem.vue';
import Parameters from './components/tabs/Parameters.vue';
import RequestTab from './components/tabs/RequestTab.vue';
import ResponseTab from './components/tabs/ResponseTab.vue';
import TabHeader from './components/tabs/TabHeader.vue';
import { Dict } from '@comet-cli/types';

const components: Dict<any> = {
  CodeSample,
  GroupSection,
  ItemList,
  NavigationSection,
  OperationSection,
  Overview,
  RequestSample,
  ResourceSection,
  ResponseSample,
  GroupItem,
  OperationItem,
  BodyItem,
  HeaderItem,
  OperationTabs,
  ParameterItem,
  Parameters,
  RequestTab,
  ResponseTab,
  TabHeader,
};

export default {
  install(Vue: any, options: any) {
    for (const component of Object.values(components)) {
      Vue.component(component.name, component);
    }
  },
};

export {
  CodeSample,
  GroupSection,
  ItemList,
  NavigationSection,
  OperationSection,
  Overview,
  RequestSample,
  ResourceSection,
  ResponseSample,
  GroupItem,
  OperationItem,
  BodyItem,
  HeaderItem,
  OperationTabs,
  ParameterItem,
  Parameters,
  RequestTab,
  ResponseTab,
  TabHeader,
};
