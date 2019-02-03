<p align="center"><img src="https://i.imgur.com/W61Wiyp.png" alt="Comet"></p>
<p align="center">Automated testing and documentation for RESTful APIs.</p>

## Usage
For usage, see the [core package](https://github.com/chiiya/comet/tree/master/packages/core).

## Setup
Comet is set up as a monorepo using lerna and yarn workspaces.

### Requirements
```bash
node # >=8.0.0
yarn # with workspaces enabled:
yarn config set workspaces-experimental true
```

### Installation
```bash
$ git clone https://github.com/chiiya/comet
$ cd comet
$ make bootstrap
```

### Configuration
Comet can be configured in many ways:
- `comet` key in your `package.json`
- `.cometrc` in JSON or YAML format
- `.cometrc.json`
- `.cometrc.yml`
- `.cometrc.toml`

The default configuration (in `.cometrc.toml`) looks like the following:

```toml
[default]
parser = "@comet-cli/parser-open-api"

[commands.make.schemas]
decorators = ["@comet-cli/decorator-json-schemas"]
factories = ["@comet-cli/factory-json-schemas"]
output = "exports/schemas"

[commands.make.tests]
decorators = ["@comet-cli/decorator-json-schemas", "@comet-cli/decorator-tests"]
factories = ["@comet-cli/factory-tests-laravel"]
output = "tests/Comet"
base_url = "http://localhost" # Local app url used for sending requests to infer parameter values
```

## Example
From the `demo/api1.yaml` file, Comet can generate the following Laravel test case definitions:
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use EnricoStahn\JsonAssert\Assert as JsonAssert;

class CometApiTest extends TestCase
{
    use RefreshDatabase, JsonAssert, HasHooks;

    public function testVersionIndex()
    {
        $body = null;
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('get', '/version', $headers, $body);
        $response->assertSuccessful();
        $responseContent = $response->getContent();
        $this->assertJsonMatchesSchema(json_decode($responseContent), './schemas/version-index.json');
    }

    public function testVersionIndexWithCountry()
    {
        $body = null;
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('get', '/version?country=SE', $headers, $body);
        $response->assertSuccessful();
        $responseContent = $response->getContent();
        $this->assertJsonMatchesSchema(json_decode($responseContent), './schemas/version-index.json');
    }

    public function testCountriesIndex()
    {
        $body = null;
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('get', '/countries', $headers, $body);
        $response->assertSuccessful();
        $responseContent = $response->getContent();
        $this->assertJsonMatchesSchema(json_decode($responseContent), './schemas/countries-index.json');
    }

    public function testCreateCountry()
    {
        $body = '{"name":"Sweden","code":"SE","languages":[{"name":"English","code":"en"}]}';
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('post', '/countries', $headers, $body);
        $response->assertSuccessful();
        $responseContent = $response->getContent();
        $this->assertJsonMatchesSchema(json_decode($responseContent), './schemas/countries-store.json');
    }

    public function testCreateCountryWithFaultyCodeMinLength()
    {
        $body = '{"name":"Sweden","code":"k","languages":[{"name":"English","code":"en"}]}';
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('post', '/countries', $headers, $body);
        $this->assertHasClientError($response);
    }

    public function testCreateCountryWithFaultyCodeMaxLength()
    {
        $body = '{"name":"Sweden","code":"SxB","languages":[{"name":"English","code":"en"}]}';
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('post', '/countries', $headers, $body);
        $this->assertHasClientError($response);
    }

    public function testContentsShowWithCountry()
    {
        $body = null;
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('get', '/contents/SE', $headers, $body);
        $response->assertSuccessful();
        $responseContent = $response->getContent();
        $this->assertJsonMatchesSchema(json_decode($responseContent), './schemas/contents-show.json');
    }

    /**
     * Assert that a test response returned a client error (4xx).
     * @param \Illuminate\Foundation\Testing\TestResponse $response
     */
    protected function assertHasClientError($response)
    {
        PHPUnit::assertTrue(
            $response->isClientError(),
            'Response status code ['.$response->getStatusCode().'] is not a client error status code.'
        );
    }

    /**
     * Get default JSON request headers.
     * @param string $body
     * @return array
     */
    protected function getJsonHeaders($body)
    {
        return  [
            'CONTENT_LENGTH' => mb_strlen($body, '8bit'),
            'CONTENT_TYPE' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    /**
     * Execute the test request.
     * @param $method
     * @param $path
     * @param $headers
     * @param $body
     * @return \Illuminate\Foundation\Testing\TestResponse
     */
    protected function executeRequest($method, $path, $headers, $body)
    {
        return $this
            ->before()
            ->call($method, $path, [], [], [], $this->transformHeadersToServerVars($headers), $body);
    }
}
```
