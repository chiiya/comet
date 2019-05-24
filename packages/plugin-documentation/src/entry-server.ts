import { createApp } from './app';
import Transformer from './transformer';

export default async (context: any): Promise<any> => {
  const { app, store } = await createApp();
  store.registerModule('Api', {
    namespaced: true,
    state: Transformer.execute(context.model),
  });
  context.state = store.state;

  return app;
};
