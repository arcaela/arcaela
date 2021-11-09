require("colors");
const glob = require("glob");



/**
 * 
 * @param {string} text 
 * @param {number} tabs 
 * @returns 
 */
function print(text = "", tabs = 1, last = false){
    console.log( new Array( Math.max( Math.round( tabs ), 1 ) - 1 )
        .fill("│").concat( last ? '└──' : "├──").join("   ").concat( text ) )
}

/**
 * 
 * @param {Object.<string, Object.<string, {}>>} dir 
 * @param {number} tabs 
 */
function parse(dir = {}, tabs = 1){
    let names = Object.keys( dir );
    for(let i=0;i<names.length;i++){
        let isLast = (i === names.length-1);
        let dirname = names[ i ];
        let folder = dir[ dirname ];
        if( folder ){
            print( '>> ' + dirname.blue + '/', tabs, isLast);
            parse(folder, tabs + 1);
        }
        else if( dirname.match(/\.d\.ts$/) ) {
            print( dirname.bold.blue, tabs, isLast);
        }
        else if( dirname.match(/\.js$/) ) {
            print( dirname.bold.yellow, tabs, isLast);
        }
        else print( dirname, tabs, isLast );
    }
}


/**
 * 
 * @param {string} pattern 
 * @param {glob.IOptions} options 
 */
function ls(pattern = "./**", options = { ignore: [] }){
    let matches = glob.sync( pattern, {
        nodir: true,
        ...options,
        ignore:["node_modules"].concat( options.ignore ),
    });
    const tree = {};
    while( matches.length ){
        let match = matches.shift()?.replace(/\.?\//g, "/").split("/").filter(e=> !!e);
        let dirname = match.shift();
        let basename = match.pop();
        let current = tree[ dirname ] ||= basename ? {} : null;
            for(let path of match)
                current = current[ path ] = {};
        current ? current[basename] = null : null;
    }
    parse( tree );
};

ls( "./**", {
    ignore:["./node_modules/**"]
} );