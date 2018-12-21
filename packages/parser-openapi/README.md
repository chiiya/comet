## `@comet-cli/parser-openapi`

This package contains the implementation of an OpenAPI v3 parser.

### Usage

```typescript
import OpenApiParser from '@comet-cli/parser-openapi';

async function main() {
  const parser = new OpenApiParser();
  const spec = await parser.execute('api.yaml');
}
```
