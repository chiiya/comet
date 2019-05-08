## `@comet-cli/adapter-open-api`

This package contains the implementation of an OpenAPI v3 adapter.

### Usage

```typescript
import OpenApiAdapter from adapter-openapi;

async function main() {
  const adapter = new OpenApiAdapter();
  const model = await adapter.execute('api.yaml', config, logger);
}
```
