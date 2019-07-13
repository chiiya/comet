import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'resizable-textarea',
})
export default class ResizableTextarea extends Vue {
  public name: string = 'resizable-textarea';
  @Prop(String) public readonly value!: string;

  resizeTextarea (event: Event) {
    const target = <HTMLElement>event.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }

  mounted () {
    this.$nextTick(() => {
      this.$el.setAttribute('style', `height: ${this.$el.scrollHeight}px;min-height:100px;overflow-y:hidden;`);
    });

    this.$el.addEventListener('input', this.resizeTextarea);
  }

  beforeDestroy () {
    this.$el.removeEventListener('input', this.resizeTextarea);
  }

  render () {
    // @ts-ignore
    return this.$slots.default[0];
  }
}
