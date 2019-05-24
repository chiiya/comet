import { resolve} from 'path';
import App from './App.vue';

const template = resolve(__dirname, '../src/index.template.html');
const css = resolve(__dirname, '../assets/dist/style.css');
const js = resolve(__dirname, '../assets/dist/bundle.js');

export { App, template, css, js };
