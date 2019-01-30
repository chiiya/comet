## `@comet-cli/factory-tests-laravel`

This package contains the implementation of a Laravel tests factory. It can generate test cases for the Laravel PHP framework
based on previously decorated test case definitions.

### Usage

```typescript
import LaravelTestsFactory from '@comet-cli/factory-tests-laravel';

async function main() {
  const model = {}; // Your API specification meta-model
  const factory = new LaravelTestsFactory();
  await factory.execute(model);
}
```
