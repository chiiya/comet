## `@comet-cli/factory-json-schema`

This package contains the implementation of a JSON Schema factory. It can generate JSON Schemas based on a
comet API meta-model.

### Usage

```typescript
import JsonSchemaFactory from factory-json-schemas;

async function main() {
  const factory = new JsonSchemaFactory();
  await factory.execute(model);
}
```
