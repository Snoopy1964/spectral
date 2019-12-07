import { extractSourceFromRef, hasRef, isLocalRef, pointerToPath } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { ICache, IGraphNodeData, IUriParser } from '@stoplight/json-ref-resolver/types';
import { extname, resolve } from '@stoplight/path';
import { Dictionary, JsonPath } from '@stoplight/types';
import { IParserResult } from '@stoplight/types/dist';
import { DepGraph } from 'dependency-graph';
import { get } from 'lodash';
import { Document, IDocument } from './document';
import { formatParserDiagnostics, formatResolverErrors } from './error-messages';
import * as Parsers from './parsers';
import { IParser } from './parsers/types';
import { IResolver, IRuleResult } from './types';
import { getEndRef, isAbsoluteRef, safePointerToPath, traverseObjUntilRef } from './utils';

// todo: rename to resolving service and move parseResolveResult
export class Resolved {
  private static readonly _cachedRemoteDocuments = new WeakMap<ICache | IResolver, Dictionary<Document>>();

  public graph!: DepGraph<IGraphNodeData>;
  public resolved: unknown;
  public errors!: IRuleResult[];
  public diagnostics: IRuleResult[] = [];

  public readonly referencedDocuments: Dictionary<Document>;

  public get source() {
    return this.document.source;
  }

  public get unresolved() {
    return this.document.data;
  }

  public get formats() {
    return this.document.formats;
  }

  constructor(public readonly document: IDocument, protected resolver: IResolver) {
    const cacheKey = resolver instanceof Resolver ? resolver.uriCache : resolver;
    const cachedDocuments = Resolved._cachedRemoteDocuments.get(cacheKey);
    if (cachedDocuments) {
      this.referencedDocuments = cachedDocuments;
    } else {
      this.referencedDocuments = {};
      Resolved._cachedRemoteDocuments.set(cacheKey, this.referencedDocuments);
    }
  }

  public async resolve() {
    const resolveResult = await this.resolver.resolve(this.document.data, {
      baseUri: this.document.source,
      parseResolveResult: this.parseResolveResult,
    });

    this.graph = resolveResult.graph;
    this.resolved = resolveResult.result;
    this.errors = formatResolverErrors(this.document, resolveResult.errors);
  }

  // todo: rename, findAssociatedDocForPath? return { document: IDocument, path: jsonPath } | null
  public getParsedForJsonPath(path: JsonPath) {
    try {
      const newPath: JsonPath = [...path];
      let $ref = traverseObjUntilRef(this.unresolved, newPath);

      if ($ref === null) {
        return {
          path,
          doc: this.document,
        };
      }

      let { source } = this;

      while (true) {
        if (source === void 0) return null;

        $ref = getEndRef(this.graph.getNodeData(source).refMap, $ref);

        if ($ref === null) return null;

        if (isLocalRef($ref)) {
          return {
            path: pointerToPath($ref),
            doc: source === this.document.source ? this.document : this.referencedDocuments[source],
          };
        }

        const extractedSource = extractSourceFromRef($ref)!;
        source = isAbsoluteRef(extractedSource) ? extractedSource : resolve(source, '..', extractedSource);

        const doc = source === this.document.source ? this.document : this.referencedDocuments[source];
        const scopedPath = [...safePointerToPath($ref), ...newPath];

        const obj = scopedPath.length === 0 || hasRef(doc.data) ? doc.data : get(doc.data, scopedPath);

        if (hasRef(obj)) {
          $ref = obj.$ref;
        } else {
          return {
            doc,
            path: scopedPath,
          };
        }
      }
    } catch {
      return null;
    }
  }

  protected parseResolveResult = async (resolveOpts: IUriParser) => {
    const source = resolveOpts.targetAuthority.href().replace(/\/$/, '');
    const ext = extname(source);

    const content = String(resolveOpts.result);
    const parser: IParser<IParserResult<unknown, any, any, any>> = ext === '.json' ? Parsers.Json : Parsers.Yaml;
    const document = new Document(content, parser, source);

    resolveOpts.result = parser.parse(content).data; // document.data;
    if (document.diagnostics.length > 0) {
      this.diagnostics.push(...formatParserDiagnostics(document.diagnostics, document.source));
    }

    this.referencedDocuments[source] = document;

    return resolveOpts;
  };
}
