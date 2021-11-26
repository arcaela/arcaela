'use strict';
var BuiltinModule = require('module');
var Module = module.constructor.length > 1
    ? module.constructor
    : BuiltinModule;
var nodePath = require('path');
var modulePaths = [];
var moduleAliases = {};
var moduleAliasNames = [];
var oldNodeModulePaths = Module._nodeModulePaths;
Module._nodeModulePaths = function (from) {
    var paths = oldNodeModulePaths.call(this, from);
    // Only include the module path for top-level modules
    // that were not installed:
    if (from.indexOf('node_modules') === -1) {
        paths = modulePaths.concat(paths);
    }
    return paths;
};
var oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parentModule, isMain, options) {
    for (var i = moduleAliasNames.length; i-- > 0;) {
        var alias = moduleAliasNames[i];
        if (isPathMatchesAlias(request, alias)) {
            var aliasTarget = moduleAliases[alias];
            // Custom function handler
            if (typeof moduleAliases[alias] === 'function') {
                var fromPath = parentModule.filename;
                aliasTarget = moduleAliases[alias](fromPath, request, alias);
                if (!aliasTarget || typeof aliasTarget !== 'string') {
                    throw new Error('[module-alias] Expecting custom handler function to return path.');
                }
            }
            request = nodePath.join(aliasTarget, request.substr(alias.length));
            // Only use the first match
            break;
        }
    }
    return oldResolveFilename.call(this, request, parentModule, isMain, options);
};
function isPathMatchesAlias(path, alias) {
    if (path.indexOf(alias) === 0) {
        if (path.length === alias.length)
            return true;
        if (path[alias.length] === '/')
            return true;
    }
    return false;
}
function addPathHelper(path, targetArray) {
    path = nodePath.normalize(path);
    if (targetArray && targetArray.indexOf(path) === -1)
        targetArray.unshift(path);
}
function removePathHelper(path, targetArray) {
    if (targetArray) {
        var index = targetArray.indexOf(path);
        if (index !== -1)
            targetArray.splice(index, 1);
    }
}
function addPath(path) {
    var parent;
    path = nodePath.normalize(path);
    if (modulePaths.indexOf(path) === -1) {
        modulePaths.push(path);
        var mainModule = getMainModule();
        if (mainModule)
            addPathHelper(path, mainModule.paths);
        parent = module.parent;
        while (parent && parent !== mainModule) {
            addPathHelper(path, parent.paths);
            parent = parent.parent;
        }
    }
}
/**
 *
 * @param {Object.<string, string>} aliases
 */
function addAliases(aliases) {
    for (var alias in aliases) {
        addAlias(alias, aliases[alias]);
    }
}
/**
 *
 * @param {string} alias
 * @param {string} target
 */
function addAlias(alias, target) {
    moduleAliases[alias] = target;
    moduleAliasNames = Object.keys(moduleAliases);
    moduleAliasNames.sort();
}
function reset() {
    var mainModule = getMainModule();
    modulePaths.forEach(function (path) {
        if (mainModule)
            removePathHelper(path, mainModule.paths);
        Object.getOwnPropertyNames(require.cache).forEach(function (name) {
            if (name.indexOf(path) !== -1)
                delete require.cache[name];
        });
        var parent = module.parent;
        while (parent && parent !== mainModule) {
            removePathHelper(path, parent.paths);
            parent = parent.parent;
        }
    });
    modulePaths = [];
    moduleAliases = {};
    moduleAliasNames = [];
}
function getMainModule() {
    return '_simulateRepl' in require.main ? undefined : require.main;
}
/**
 *
 * @param {{ "base": string }} [options]
 */
function init(options) {
    options = (typeof options === 'string') ? { base: options } : options;
    var npmPackage, base;
    var candidatePackagePaths = (options === null || options === void 0 ? void 0 : options.base)
        ? [nodePath.resolve(options.base.replace(/\/package\.json$/, ''))]
        : candidatePackagePaths = [nodePath.join(__dirname, '../..'), process.cwd()];
    for (var i in candidatePackagePaths) {
        try {
            base = candidatePackagePaths[i];
            npmPackage = require(nodePath.join(base, 'package.json'));
            break;
        }
        catch (e) { }
    }
    if (typeof npmPackage !== 'object') {
        var pathString = candidatePackagePaths.join(',\n');
        throw new Error('Unable to find package.json in any of:\n[' + pathString + ']');
    }
    var aliases = npmPackage['psr-4'] || {};
    for (var alias in aliases)
        if (aliases[alias][0] !== '/')
            aliases[alias] = nodePath.join(base, aliases[alias]);
    addAliases(aliases);
    if (npmPackage._moduleDirectories instanceof Array)
        npmPackage._moduleDirectories.forEach(dir => {
            if (dir === 'node_modules')
                return;
            addPath(nodePath.join(base, dir));
        });
}
exports.init = init;
exports.reset = reset;
exports.add = addAlias;
exports.merge = addAliases;
