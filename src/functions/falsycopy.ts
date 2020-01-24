import { IFunction, IFunctionResult } from '../types';

const _ = require('lodash');

export const falsy: IFunction = (targetVal, _opts, paths): void | IFunctionResult[] => {
  if (!!targetVal) {
    return [
      {
        message: `${paths.target ? paths.target.join('.') : 'property'} is not falsy`,
      },
    ];
  }
  if (_.isEmpty(targetVal)) {
    console.log('Hallo Dumbaer');
  }
};
