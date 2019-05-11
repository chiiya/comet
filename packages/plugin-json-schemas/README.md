## `@comet-cli/plugin-json-schemas`

This package contains the implementation of a JSON Schema plugin. It can generate JSON Schemas based on a
comet API meta-model.

### Usage

```typescript
import JsonSchemaPlugin from '@comet-cli/plugin-json-schemas';

(async () => {
  const plugin = new JsonSchemaPlugin();
  await plugin.execute(model, config, logger);
})();
```
