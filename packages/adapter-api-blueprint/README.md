## `@comet-cli/adapter-api-blueprint`

This package contains the implementation of an API Blueprint adapter.

### Usage

```typescript
import ApiBlueprintAdapter from '@comet-cli/adapter-api-blueprint';

async function main() {
  const parser = new ApiBlueprintAdapter();
  const model = await parser.execute('api.apib', config, logger);
}
```
