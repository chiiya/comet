## `@comet-cli/adapter-api-blueprint`

This package contains the implementation of an API Blueprint adapter.

### Usage

```typescript
import ApiBlueprintAdapter from '@comet-cli/adapter-api-blueprint';

async function main() {
  const adapter = new ApiBlueprintAdapter();
  const model = await adapter.execute('api.apib', config, logger);
}
```
