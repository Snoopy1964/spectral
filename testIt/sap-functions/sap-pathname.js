/* eslint-disable no-console 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');

//exports.sap-pathname = (targetVal) => {
*/
/**/ 
module.exports = (targetVal) => {
  // Path MUST have 3 components
  // <namespace> : lower-dashed-case       (retail-shop)
  // <version>   : lower v + major version (v4)
  // <Resource>  : lowerCamelCase          (shoppingBasket)

  // const _ = require("lodash");


  console.log("sap-pathname...." + targetVal);
  
  // const _ = require("lodash")
/**/
  const VERSION     = /\/v\d\/+/gm;
  const LOWERDASHED = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const LOWERCAMEL  = /^[a-z]+(?:[A-Z][a-z]+)*$/;

  let path;
  if (targetVal.startsWith('/')) {
    path = targetVal.substring(1);
  } else {
    path = targetVal;
  }

  let pathComp = path.split(VERSION);

  console.log(pathComp);

  switch (pathComp.length) {
  case 2:

    break;
    
  case 1:
    return [
      {
        message: "\n    path name has no version. \n    path name has to follow <namespace = lower-dashed-case>/v[0..9]/<Resource = lowerCamelCase\".",
      },
    ];
  default:
    return [
      {
        message: "\n    path name has multiple versions. \n    path name has to follow <namespace = lower-dashed-case>/v[0..9]/<Resource = lowerCamelCase\".",
      },
    ];
  }

  // console.log("Path components: " + pathComp);
  let namespace     = pathComp[0];
  let namespaceComp = namespace.split("/");

  let resource      = pathComp[1];
  let resourceComp  = resource.split("/");
    
  console.log("Namespace: " + namespace);
  namespaceComp.forEach(element => {
    console.log(element);
    console.log("         -> " + element.match(LOWERDASHED))
    if (isEmpty(element.match(LOWERDASHED)) == true) {
//    if (_.isEmpty(element.match(LOWERDASHED)) == true) {
        return [
        {
          message: "\n    Namespace " + namespace + " MUST follow lower-dashed-case.",
        },
      ];
  
    }
  });
  
  console.log("Resource: " + resource);
  resourceComp.forEach(element => {
    console.log(element);
    console.log("         -> " + element.match(LOWERCAMEL));
    if (element.match(LOWERCAMEL) === null) {
      return [
        {
          message: "\n    Namespace " + namespace + " MUST follow lower-dashed-case.",
        },
      ];
  
    }
  });
           
  // if (pathComp.length != 2) {
  //   return [
  //     {
  //       message: "path name has to follow <namespace = lower-dashed-case>/v[0..9]/<Resource = lowerCamelCase\".",
  //     },
  //   ];
  // }


};

function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}
