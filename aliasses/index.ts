'use strict'

var BuiltinModule = require('module')

var Module = module.constructor.length > 1
  ? module.constructor
  : BuiltinModule

var nodePath = require('path')

var modulePaths = []
var moduleAliases = {}
var moduleAliasNames = []

var oldNodeModulePaths = Module._nodeModulePaths
Module._nodeModulePaths = function (from) {
  var paths = oldNodeModulePaths.call(this, from)
  if (from.indexOf('node_modules') === -1)
    paths = modulePaths.concat(paths)
  return paths
}
var oldResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parentModule, isMain, options) {
  for (var i = moduleAliasNames.length; i-- > 0;) {
    var alias = moduleAliasNames[i]
    if (isPathMatchesAlias(request, alias)) {
      var aliasTarget = moduleAliases[alias]
      if (typeof moduleAliases[alias] === 'function') {
        var fromPath = parentModule.filename
        aliasTarget = moduleAliases[alias](fromPath, request, alias)
        if (!aliasTarget || typeof aliasTarget !== 'string') {
          throw new Error('[module-alias] Expecting custom handler function to return path.')
        }
      }
      request = nodePath.join(aliasTarget, request.substr(alias.length))
      break
    }
  }
  return oldResolveFilename.call(this, request, parentModule, isMain, options)
}
function isPathMatchesAlias (path, alias) {
  if (path.indexOf(alias) === 0) {
    if (path.length === alias.length) return true
    if (path[alias.length] === '/') return true
  }
  return false
}
function addPathHelper (path, targetArray) {
  path = nodePath.normalize(path)
  if (targetArray && targetArray.indexOf(path) === -1)
    targetArray.unshift(path)
}
function removePathHelper (path, targetArray) {
  if (targetArray) {
    var index = targetArray.indexOf(path)
    if (index !== -1)
      targetArray.splice(index, 1)
  }
}
function addPath (path) {
  var parent
  path = nodePath.normalize(path)
  if (modulePaths.indexOf(path) === -1) {
    modulePaths.push(path)
    var mainModule = getMainModule()
    if (mainModule)
      addPathHelper(path, mainModule.paths)
    parent = module.parent
    while (parent && parent !== mainModule) {
      addPathHelper(path, parent.paths)
      parent = parent.parent
    }
  }
}
function getMainModule () {
  return '_simulateRepl' in require.main ? undefined : require.main
}

/**
 * @example
 * addAliasses({
 *  "js":__dirname + "/dist/js/",
 *  "css":__dirname + "/dist/css/",
 * });
 * 
 * require("js/index");
 * require("css/index.css");
 * 
 * @param aliases - Add aliasses as Object Alias
 */
export function addAliases<A extends Record<string, string>> (aliases: A) : void {
  for (var alias in aliases) {
    addAlias(alias, aliases[alias])
  }
}
/**
 * 
 * @param {string} alias 
 * @param {string} target 
 */
export function addAlias (alias: string, target: string) : void {
  moduleAliases[alias] = target
  moduleAliasNames = Object.keys(moduleAliases)
  moduleAliasNames.sort()
}
/**
 * Remove all aliasses from registry.
 */
export function reset () : void {
  var mainModule = getMainModule()
  modulePaths.forEach(function (path) {
    if (mainModule) removePathHelper(path, mainModule.paths)
    Object.getOwnPropertyNames(require.cache).forEach(function (name) {
      if (name.indexOf(path) !== -1)
        delete require.cache[name]
    })
    var parent = module.parent
    while (parent && parent !== mainModule) {
      removePathHelper(path, parent.paths)
      parent = parent.parent
    }
  })
  modulePaths = []
  moduleAliases = {}
  moduleAliasNames = []
}