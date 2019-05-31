import { createApp } from './app';
import Transformer from '@comet-cli/helper-documentation';

export default async (context: any): Promise<any> => {
  const { app, store } = await createApp();
  store.registerModule('Api', {
    namespaced: true,
    state: Transformer.execute(context.model, context.config),
  });
  context.state = store.state;

  return app;
};
