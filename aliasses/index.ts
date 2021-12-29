'use strict'

const __path = require("path");
const __main = '_simulateRepl' in require.main ? undefined : require.main;
const __module = module.constructor.length ? module.constructor : require("module");
const __store = {
    paths:[],
    alias:{},
    aliasNames:[],
};

let __nodeModulePaths = __module._nodeModulePaths;
__module._nodeModulePaths = src=>{
    let paths = __nodeModulePaths.call(__module, src);
    return src.indexOf("node_modules")<0 ? __store.paths.concat( paths ) : paths;
};

let __resolveFilename = __module._resolveFilename;
__module._resolveFilename = function _resolveFilename(req, parent, main: boolean, opts: object){
    for(let alias of __store.aliasNames){
        if(isAlias(req,alias)){
            let target = __store.alias[ alias ];
            if(typeof target === 'function'){
                let from = parent.filename;
                target = target(from, req, alias);
                if(!target || typeof target!=='string')
					throw new Error('[module-alias] Expecting custom handler function to return path.')
            }
            req = __path.join(target, req.substr(alias.length));
            break;
        }
    }
    return __resolveFilename.call(this, req, parent, main, opts);
}

function isAlias(path: string, alias: string) : boolean {
    return path.indexOf(alias)===0 && (
        path.length===alias.length || path[ alias.length ]==='/'
    );
}

function removeAlias(path: string, target: string[]) : void {
    if(target){
        let i = target.indexOf(path);
        if(i>=0) target.splice(i,1);
    }
}

namespace Arcaela {
    export module aliasses {
        /**
         * 
         * @param {string} alias 
         * @param {string} target 
         */
        export function add(alias: string, target: string){
            __store.alias[ alias ] = target;
            __store.aliasNames = Object.keys( __store.alias );
            __store.aliasNames = __store.aliasNames.sort();
        }
        /**
         * @example
         * merge({
         *  "js":__dirname + "/dist/js/",
         *  "css":__dirname + "/dist/css/",
         * });
         * 
         * require("js/index");
         * require("css/index.css");
         * 
         * @param alias - Add aliasses as Object Alias
         */
        export function merge(alias: Record<string, string>){
            for(let a in alias)
                add(a, alias[a]);
        }
        /**
         * Remove all aliasses from registry.
         */
        export function reset () : void {
            __store.paths.forEach(function (path) {
                if (__main) removeAlias(path, __main.paths);
                Object.getOwnPropertyNames(require.cache).forEach(function (name) {
                    if (name.indexOf(path) !== -1)
                        delete require.cache[name]
                })
                var parent = module.parent
                while (parent && parent !== __main) {
                    removeAlias(path, parent.paths)
                    parent = parent.parent
                }
            });
            __store.paths = [];
            __store.alias = {};
            __store.aliasNames = [];
        }
    }
}

export = Arcaela.aliasses;