## `@comet-cli/decorator-json-schemas`

This package contains the implementation of a JSON Schema decorator. It will transform OpenAPI
schema definitions to valid JSON schemas.

### Usage

```typescript
import JsonSchemaDecorator from '@comet-cli/decorator-json-schemas';

async function main() {
  const decorator = new JsonSchemaDecorator();
  const schema = decorator.execute(openApiSchema);
}
```
