![Spectral logo](img/spectral-banner.png)

[![Test Coverage](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/test_coverage)](https://codeclimate.com/github/stoplightio/spectral/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/maintainability)](https://codeclimate.com/github/stoplightio/spectral/maintainability)

A flexible JSON object linter with out of the box support for OpenAPI v2 and v3

## Features

- Create custom rules to lint _any JSON object_
- Use JSON paths to apply rules / functions to specific parts of your JSON objects
- Built-in set of functions to help [build custom rulesets](docs/rulesets.md). Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc
- Default ready to use rules and functions to validate and lint OpenAPI v2 _and_ v3 documents
- Validate JSON with [Ajv](https://github.com/epoberezkin/ajv)

## Installation

### Local Installation

```bash
npm install @stoplight/spectral
```

### Global Installation

```bash
npm install -g @stoplight/spectral
```

Supports Node v8.3+.

### Executable binaries

For users without Node and/or NPM/Yarn, we provide standalone packages for all major platforms. We also provide a shell script to auto download the executable based on your operating system:

`curl -L https://raw.githack.com/stoplightio/spectral/master/install.sh | sh`

Note, the binaries are *not* auto-updatable, therefore you will need to download a new version on your own.

#### Installing binaries system-wide

##### Linux

```bash
sudo mv ./spectral-linux /usr/local/bin/spectral
```

You may need to restart your terminal.
Now, `spectral` command will be accessible in your terminal.

Head over to [releases](https://github.com/stoplightio/spectral/releases) for the latest binaries.


### Docker
```bash
docker run --rm -it stoplight/spectral lint "${URL}"`
```

## Usage

### CLI

Spectral can be run via the command-line:

```bash
spectral lint petstore.yaml
```

Other options include:

``` text
  -c, --config=config          path to a config file
  -e, --encoding=encoding      text encoding to use
  -f, --format=json|stylish    formatter to use for outputting results
  -h, --help                   show CLI help
  -o, --output=output          output to a file instead of stdout
  -q, --quiet                  no logging - output only
  -r, --ruleset=ruleset        path to a ruleset file (supports remote files)
  -s, --skip-rule=skip-rule    ignore certain rules if they are causing trouble
  -v, --verbose                increase verbosity
  --max-results=max-results    [default: all] maximum results to show
```

> Note: The Spectral CLI supports both YAML and JSON.

Currently, Spectral CLI supports validation of OpenAPI documents and lints them based on our default ruleset, or you can provide [your own rulesets](docs/rulesets.md).

## Concepts

There are three key concepts in Spectral: **Rulesets**, **Rules** and **Functions**.

- **Ruleset** is a container for a collection of rules and functions.
- **Rule** filters your object down to a set of target values, and specify the function that should evaluate those values.
- **Function** accept a value and return issue(s) if the value is incorrect.

Think of a set of **rules** and **functions** as a flexible and customizable style guide for your JSON objects.

## Config

Spectral CLI supports [config files](docs/config.md), to avoid typing out CLI options and arguments every single time.

## Programmatic usage

Spectral is written in TypeScript (JavaScript) and can be used directly for when you need to use Spectral programmatically. Take a look at our ["JavaScript API documentation"](docs/js-api.md).

## FAQs

**How is this different than [Ajv](https://github.com/epoberezkin/ajv)?**

Ajv is a popular JavaScript JSON Schema validator, but it is not a linter. Validators just check if something is technically correct, but a linter goes a step further than that and programmatically applies opinions, which is what style guide really is. 

Spectral uses AJV to expose a `schema` function, which you can use in your rules to validate all or part of the target object with JSON Schema. Spectral also provides a number of other functions and utilities that you can use to build up a linting ruleset to validates things that JSON Schema is not well suited for.

**I want to lint my OpenAPI documents but don't want to implement Spectral right now.**

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_campaign=spectral).

**What is the difference between Spectral and [Speccy](https://github.com/wework/speccy)?**

With Spectral, lint rules can be applied to _any_ JSON object. Speccy is designed to work with OpenAPI v3 only. The rule structure is different between the two. Spectral uses [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead of the `object` parameters (which are OpenAPI specific), so you can write rulesets for [AsyncAPI](https://www.asyncapi.com/), standalone JSON Schema, whatever you like.

## Contributing

If you are interested in contributing to Spectral itself, check out our [contributing docs](CONTRIBUTING.md) to get started.

Also, most of the interesting projects are built _with_ Spectral. Please consider using Spectral in a project or contribute to an [existing one](#example-implementations).

If you are using Spectral in your project and want to be listed in the examples section, we encourage you to open an [issue](https://github.com/stoplightio/spectral/issues).

### Example Implementations

- [Stoplight's Custom Style and Validation Rules](https://docs.stoplight.io/modeling/modeling-with-openapi/style-validation-rules) uses Spectral to validate and lint OpenAPI documents on the Stoplight platform
- [Spectral GitHub Bot](https://github.com/tbarn/spectral-bot), a GitHub pull request bot that lints your repo's OpenAPI document that uses the [Probot](https://probot.github.io) framework, built by [Taylor Barnett](https://github.com/tbarn)
- [Spectral GitHub Action](https://github.com/XVincentX/spectral-action), a GitHub Action that lints your repo's OpenAPI document, built by [Vincenzo Chianese](https://github.com/XVincentX/)

## Helpful Links

- [JSONPath Online Evaluator](http://jsonpath.com/), a helpful tool to determine what `path` you want
- [stoplightio/json](https://github.com/stoplightio/json), a library of useful functions for when working with JSON
- [stoplightio/yaml](https://github.com/stoplightio/yaml), a library of useful functions for when working with YAML, including parsing YAML into JSON, and a few helper functions such as `getJsonPathForPosition` or `getLocationForJsonPath`

## Thanks :)

- [Phil Sturgeon](https://github.com/philsturgeon) for collaboration and creating Speccy
- [Mike Ralphson](https://github.com/MikeRalphson) for kicking off the Spectral CLI and contributions to Speccy

## Support

If you have a bug or feature request, please open an issue [here](https://github.com/stoplightio/spectral/issues).

If you need help using Spectral or have a support question, please use the [Stoplight Community forum](https://community.stoplight.io). We've created an open source category for these questions. It's also a great place to share your implementations.

If you want to discuss something in private, you can reach out to Stoplight support at [support@stoplight.io](mailto:support@stoplight.io).
