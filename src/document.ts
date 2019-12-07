import { normalize } from '@stoplight/path';
import { GetLocationForJsonPath, IParserResult } from '@stoplight/types';
import { formatParserDiagnostics } from './error-messages';
import { IParser } from './parsers/types';
import { IRuleResult } from './types';
import { isObjectLiteral } from './utils/isObjectLiteral';

export const isDocument = (obj: unknown): obj is IDocument => {
  if (obj instanceof Document) return true;
  if (!isObjectLiteral(obj)) return false;
  if (!isObjectLiteral(obj.data)) return false;
  if (typeof obj.getLocationForJsonPath !== 'function') return false;

  // todo: chekc formats, diagnostics, etc
  return true;
};

export interface IDocument<D = unknown, R extends IParserResult = IParserResult<D, any, any, any>> {
  readonly parsed: R;
  readonly data: D;
  readonly getLocationForJsonPath: GetLocationForJsonPath<R>; // todo: bind?
  readonly source?: string;
  formats?: string[] | null;
  readonly diagnostics: IRuleResult[];
}

export class Document<D = unknown, R extends IParserResult = IParserResult<D>> implements IDocument<D, R> {
  public readonly parsed: R;
  public readonly getLocationForJsonPath: GetLocationForJsonPath<R>;

  constructor(protected readonly input: string, parser: IParser<R>, private readonly _source?: string) {
    this.parsed = parser.parse(input);
    this.getLocationForJsonPath = parser.getLocationForJsonPath;
  }

  public get source() {
    // we need to normalize the path in case path with forward slashes is given
    return this._source && normalize(this._source);
  }

  public get data() {
    return this.parsed.data;
  }

  public get diagnostics() {
    return formatParserDiagnostics(this.parsed.diagnostics);
  }
}
