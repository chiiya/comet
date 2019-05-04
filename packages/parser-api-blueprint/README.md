## `@comet-cli/parser-api-blueprint`

This package contains the implementation of an API Blueprint parser.

### Usage

```typescript
import ApiBlueprintParser from '@comet-cli/parser-api-blueprint';

async function main() {
  const parser = new ApiBlueprintParser();
  const model = await parser.execute('api.yaml', config, logger);
}
```
