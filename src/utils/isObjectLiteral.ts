import { isObject } from 'lodash';

export function isObjectLiteral(maybeObj: unknown): maybeObj is { [key in PropertyKey]: unknown } {
  if (!isObject(maybeObj)) return false;

  const proto = Object.getPrototypeOf(maybeObj);
  return proto === null || proto === Object.prototype;
}
