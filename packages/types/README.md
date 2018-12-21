## `@comet-cli/types`

This package contains all common type definitions and interfaces used across other comet packages.

If you wish to develop your own comet packages, make sure to require this package and implement
the necessary interfaces.

### Usage

```typescript
import { Parser, OpenApiSpec } from '@comet-cli/types';

export default class MyFancyParser implements Parser {
  async execute(path: string): Promise<OpenApiSpec> {
      // return something
  }
}
```
