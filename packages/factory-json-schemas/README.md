## `@comet-cli/factory-json-schemas`

This package contains the implementation of a JSON Schema factory. It can generate JSON Schemas based on a
comet API meta-model.

### Usage

```typescript
import JsonSchemaFactory from '@comet-cli/factory-json-schemas';

async function main() {
  const model = {} // Your API specification meta-model
  const factory = new JsonSchemaFactory();
  await factory.execute(model);
}
```
