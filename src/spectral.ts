import { safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { Dictionary } from '@stoplight/types';
import { merge } from 'lodash';

import { STATIC_ASSETS } from './assets';
import { IDocument, isDocument } from './document';
import { Document } from './document';
import { functions as defaultFunctions } from './functions';
import * as Parsers from './parsers';
import { Resolved } from './resolved';
import { readRuleset } from './rulesets';
import { compileExportedFunction } from './rulesets/evaluators';
import { IRulesetReadOptions } from './rulesets/reader';
import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from './rulesets/severity';
import { runRules } from './runner';
import {
  FormatLookup,
  FunctionCollection,
  IConstructorOpts,
  IResolver,
  IRuleResult,
  IRunOpts,
  ISpectralFullResult,
  PartialRuleCollection,
  RegisteredFormats,
  RuleCollection,
  RunRuleCollection,
} from './types';
import { IRuleset } from './types/ruleset';
import { empty } from './utils';

export * from './types';

export class Spectral {
  private readonly _resolver: IResolver;

  public functions: FunctionCollection = { ...defaultFunctions };
  public rules: RunRuleCollection = {};
  public formats: RegisteredFormats;

  constructor(opts?: IConstructorOpts) {
    this._resolver = opts?.resolver || new Resolver();
    this.formats = {};
  }

  public static registerStaticAssets(assets: Dictionary<string, string>) {
    empty(STATIC_ASSETS);
    Object.assign(STATIC_ASSETS, assets);
  }

  public async runWithResolved(target: IDocument | object | string, opts: IRunOpts = {}): Promise<ISpectralFullResult> {
    const document: IDocument = isDocument(target)
      ? target
      : new Document(
          typeof target === 'string' ? target : safeStringify(target, undefined, 2),
          Parsers.Yaml,
          opts.resolve?.documentUri,
        );

    if (opts.resolve?.documentUri && document.source === void 0) {
      (document as Omit<IDocument, 'source'> & { source: IDocument['source'] }).source = opts.resolve.documentUri;
    }

    const resolved = new Resolved(document, this._resolver);
    await resolved.resolve();

    if (document.formats === void 0) {
      const foundFormats = Object.keys(this.formats).filter(format => this.formats[format](resolved.resolved));
      document.formats = foundFormats.length === 0 ? null : foundFormats;
    }

    const validationResults: IRuleResult[] = [
      ...resolved.diagnostics,
      ...document.diagnostics,
      ...resolved.errors,
      ...runRules(resolved, this.rules, this.functions),
    ];

    return {
      resolved: resolved.resolved,
      results: validationResults,
    };
  }

  public async run(target: IDocument | object | string, opts: IRunOpts = {}): Promise<IRuleResult[]> {
    return (await this.runWithResolved(target, opts)).results;
  }

  public setFunctions(functions: FunctionCollection) {
    empty(this.functions);

    Object.assign(this.functions, { ...defaultFunctions, ...functions });
  }

  public setRules(rules: RuleCollection) {
    empty(this.rules);

    for (const name in rules) {
      if (!rules.hasOwnProperty(name)) continue;
      const rule = rules[name];

      this.rules[name] = {
        name,
        ...rule,
        severity: rule.severity === void 0 ? DEFAULT_SEVERITY_LEVEL : getDiagnosticSeverity(rule.severity),
      };
    }
  }

  public mergeRules(rules: PartialRuleCollection) {
    for (const name in rules) {
      if (!rules.hasOwnProperty(name)) continue;
      const rule = rules[name];
      if (rule) {
        this.rules[name] = merge(this.rules[name], rule);
      }
    }
  }

  public async loadRuleset(uris: string[] | string, options?: IRulesetReadOptions) {
    this.setRuleset(await readRuleset(Array.isArray(uris) ? uris : [uris], options));
  }

  public setRuleset(ruleset: IRuleset) {
    this.setRules(ruleset.rules);

    this.setFunctions(
      Object.entries(ruleset.functions).reduce<FunctionCollection>(
        (fns, [key, { code, ref, name, schema }]) => {
          if (code === void 0) {
            if (ref !== void 0) {
              ({ code } = ruleset.functions[ref]);
            }
          }

          if (code === void 0) {
            // shall we log or sth?
            return fns;
          }

          fns[key] = compileExportedFunction(code, name, schema);
          return fns;
        },
        {
          ...defaultFunctions,
        },
      ),
    );
  }

  public registerFormat(format: string, fn: FormatLookup) {
    this.formats[format] = fn;
  }
}
