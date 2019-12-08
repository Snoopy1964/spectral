import { normalize } from '@stoplight/path';
import { IParserResult, IRange, JsonPath, Optional } from '@stoplight/types';
import { IDiagnostic } from '@stoplight/types/dist';
import { isObject } from 'lodash';
import { formatParserDiagnostics } from './error-messages';
import { IParser } from './parsers/types';
import { IRuleResult } from './types';
import { isObjectLiteral } from './utils/isObjectLiteral';

export const isDocument = (obj: unknown): obj is IDocument => {
  if (obj instanceof Document) return true;

  if (!isObject(obj)) return false;
  if (
    !('getRangeForJsonPath' in obj) ||
    typeof (obj as Partial<{ getRangeForJsonPath: unknown }>).getRangeForJsonPath !== 'function'
  ) {
    return false;
  }

  if (!('parserResult' in obj) || !isObjectLiteral((obj as Partial<{ parserResult: unknown }>).parserResult)) {
    return false;
  }

  if (!('diagnostics' in obj) || !Array.isArray((obj as Partial<{ diagnostics: IDiagnostic[] }>).diagnostics)) {
    return false;
  }

  return true;
};

export interface IDocument<D = unknown, R extends IParserResult = IParserResult<D, any, any, any>> {
  readonly parserResult: R;
  readonly data: D;
  getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange>;
  readonly source?: string;
  formats?: string[] | null;
  readonly diagnostics: IRuleResult[];
}

export class Document<D = unknown, R extends IParserResult = IParserResult<D>> implements IDocument<D, R> {
  public readonly parserResult: R;
  public readonly source: Optional<string>;

  constructor(protected readonly input: string, protected readonly parser: IParser<R>, source?: string) {
    this.parserResult = parser.parse(input);
    // we need to normalize the path in case path with forward slashes is given
    this.source = source && (/^[a-z]+:\/\/./i.test(source) ? source : normalize(source));
  }

  public getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange> {
    return this.parser.getLocationForJsonPath(this.parserResult, path, closest)?.range;
  }

  public get data() {
    return this.parserResult.data;
  }

  public get diagnostics() {
    return formatParserDiagnostics(this.parserResult.diagnostics);
  }
}
