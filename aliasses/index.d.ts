/// <reference types="node" />
declare var BuiltinModule: any;
declare var Module: any;
declare var nodePath: any;
declare var modulePaths: any[];
declare var moduleAliases: {};
declare var moduleAliasNames: any[];
declare var oldNodeModulePaths: any;
declare var oldResolveFilename: any;
declare function isPathMatchesAlias(path: any, alias: any): boolean;
declare function addPathHelper(path: any, targetArray: any): void;
declare function removePathHelper(path: any, targetArray: any): void;
declare function addPath(path: any): void;
/**
 *
 * @param {Object.<string, string>} aliases
 */
declare function addAliases(aliases: any): void;
/**
 *
 * @param {string} alias
 * @param {string} target
 */
declare function addAlias(alias: any, target: any): void;
declare function reset(): void;
declare function getMainModule(): NodeJS.Module;
/**
 *
 * @param {{ "base": string }} [options]
 */
declare function init(options: any): void;
