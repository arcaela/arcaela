const fs = require("fs");
const _require = require;
const copyfiles = require("copyfiles");
const { promify } = require("./vendor/utils");

/**
 * @type {NodeRequire}
 */
require = new Proxy(function ( _module = ""){
    if(_module?.match(/\.json$/)){
        return JSON.parse( fs.readFileSync( `${__dirname}/${_module}`, 'utf8' )
            .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m) );
    } 
    return _require(_module);
}, { set:(_, k, v)=>_require[ k ] = v, get:(_, k)=>k in _ ? _[k] : _require[ k ], });


/**
 * 
 * @param {string[]} patterns 
 * @param {string} target 
 * @param {copyfiles.Options} options 
 * @returns {Promise<string>}
 */
function copy(patterns=[], target="", options = {}){
    const promise = promify();
    copyfiles( patterns.concat( target ), { follow:true, verbose: true, ...options }, err=>{
        if( err ) promise.reject( err );
        else promise.resolve( patterns );
    });
    return promise;
};

copy(["./*.d.ts", "./!(node_modules|src)/*.d.ts",], "./src/").then(()=>{
    console.log("¡Copied!");
})