## `@comet-cli/decorator-tests`

This package contains the implementation of a test decorator for comet. It will infer parameter 
values and create test case models.

### Usage

```typescript
import TestsDecorator from '@comet-cli/decorator-tests';

async function main() {
  const model = {} // Your API specification meta-model
  const decorator = new TestsDecorator();
  await decorator.execute(model);
}
```
