const fs = require("fs");
const glob = require("glob");
const path = require("path");

const Directory = {
    /**
    * @example
    * Directory.match("./*.js").forEach(basename=> { console.log( basename ); })
    * 
    * @param {string[]} patterns - Pattern or array patterns with select files or folders.
    * @param {glob.IOptions} options - Documentations for options in [Glob]{@link https://www.npmjs.com/package/glob}
    * @returns {string[]}
    */
    match(patterns = [], options = {}){
        options = { nodir: false, cwd : require.main.path, ...options, };
        let files = [];
        for(let pattern of [].concat(patterns)){
            if( path.isAbsolute( pattern ) ) throw new Error("This version of copy does not support absolute paths, it tries with a relative path.");
            files.push( ...(glob.sync( pattern, options ) || []) )
        }
        return files;
    },

    /**
    * @description Create Directory with specified attributes.
    * @example
    * Directory.mkdir(`/home/${ username }/photos`)
    * @param {string} target - Path that will be created
    * @param {fs.MakeDirectoryOptions} options - Mkdir Options as well as {@link fs.MakeDirectoryOptions}
    * @returns {string} - Target Returned
    */
    mkdir(target = "", options = {}){
        if( !path.isAbsolute( target ) ) target = path.join( require.main.path, target );
        fs.mkdirSync(target, { recursive: true, ...options, });
        return target;
    },
    
    /**
    * @description Copy Directory & Files using Glob Pattern
    * @example
    * Directory.copy("./*.js", "./public/dist/")
    * 
    * Directory.copy(["./*.js", "/dist/css/*.css"], "./public/assets/", { flat: true })
    * @param {string | string[]} patterns - Pattern or array patterns with select files or folders.
    * @param {string} target - String with target.
    * @param {glob.IOptions} options - Documentations for options in [Glob]{@link https://www.npmjs.com/package/glob}
    * @returns {{success:{src: string, target: string}[], error:{src: string, target: string, error: Error}[]}}
    */
    copy(patterns = [], target = "", options = {}){
        if( path.isAbsolute( target ) ) throw new Error("This version of copy does not support absolute paths, it tries with a relative path.");
        const response = {success:[],error:[]};
        target = path.join( require.main.path, target );
        for(let basename of Directory.match( patterns, options )){
            if( path.isAbsolute( basename ) ) throw new Error("This version of copy does not support absolute paths, it tries with a relative path.");
            origin = path.join( require.main.path, basename );
            destinity = path.join( target, basename.replace(/^(\.\.?\/)+/g, "") );
            try{
                fs.mkdirSync( path.dirname( destinity ), { recursive: true });
                fs.copyFileSync( origin, destinity );
                response.success.push({ src: origin, target: destinity, });
            }
            catch(error){ response.error.push({ error, src: origin, target: destinity, }); }
        }
        return response;
    },
    
    /**
    * @description Move directories using a glob pattern.
    * @param {string[]} patterns - Glob patterns to find directories
    * @param {string} target - Destinity
    * @param {{ overwrite: boolean }} options - Options for move or rename Directories
    * @returns
    */
    move(patterns = [], target = "", options = {}){
        if( path.isAbsolute( target ) ) throw new Error("This version of copy does not support absolute paths, it tries with a relative path.");
        const response = {success:[],error:[]};
        target = path.join( require.main.path, target );
        Directory.match(patterns, options).forEach(basename=>{
            if( path.isAbsolute( basename ) ) throw new Error("This version of copy does not support absolute paths, it tries with a relative path.");
            origin = path.join( require.main.path, basename );
            destinity = path.join( target, basename.replace(/^(\.\.?\/)+/g, "") );
            try{
                Directory.mkdir( path.dirname( destinity ) );
                fs.renameSync( origin, destinity );
                response.success.push({ src: origin, target: destinity, });
            }
            catch(error){ response.error.push({ error, src: origin, target: destinity, }); }
        });
        return response;
    },
    
    /**
    * @description Alias for Directory Move
    * @param {string[]} patterns - Glob patterns to find directories
    * @param {string} target - Destinity
    * @param {{ overwrite: boolean }} options - Options for move or rename Directories
    * @returns {{success:{src: string, target: string}[], error:{src: string, target: string, error: Error}[]}}
    */
    rename(...arg){ return this.move(...arg); },
    
    /**
    * @description
    * @param {string|string[]} patterns 
    * @param {glob.IOptions} options 
    * @returns {{success:{src: string}[], error:{src: string, error: Error}[]}}
    */
    unlink(patterns = [], options = {}){
        const response = {success:[],error:[]};
        Directory.match(patterns, options).forEach(basename=>{
            if( path.isAbsolute( basename ) ) throw new Error("This version of copy does not support absolute paths, it tries with a relative path.");
            basename = path.join( require.main.path, basename );
            try{
                fs.unlinkSync( basename );
                response.success.push({ src: basename, });
            }
            catch(error){ response.error.push({ error, src: basename, }); }
        });
        return response;
    },
    
};
const File = {
    /**
     * @description Create file dinamically
     * @param {fs.PathOrFileDescriptor} filename - Path to locate file
     * @param {string | NodeJS.ArrayBufferView} content - Content to put into file.
     * @param {fs.WriteFileOptions | (filename: string)=>void } type 
     * @param {(filename: string)=> void} cb 
     * @returns {never}
     */
    write(filename = "", content = "", type = {}, cb){
        content = typeof content==='function' ? content( filename ) : content;
        cb ||= typeof type==='function' ? type : null;
        type = typeof type==='function' ? {} : type;
        filename = path.isAbsolute( filename ) ? filename : path.join( require.main.path, filename );
        try{
            fs.writeFileSync(filename, content);
            if(cb) cb(null, filename);
        } catch(err){ if(cb) cb(err, null); }
    },

    /**
    * @description Alias for Directory Unlink, but only file is true.
    * @param {string|string[]} patterns
    * @param {glob.IOptions} options
    * @returns {never}
    */
    unlink(patterns = [], options = {}){
        Directory.unlink( patterns, {...options, nodir: true } );
    },
     
    /**
     * @description Read file sync, use this for sync functions only.
     * @param {fs.PathOrFileDescriptor} filename 
     * @param {BufferEncoding | { encoding?: null | undefined; flag?: string | undefined; }} options 
     * @param {(err: Error | null, data: Buffer)=> void} cb 
     * @returns {Buffer | any}
     */
    read(filename = "", options = {}, cb){
        cb ||= typeof options==='function' ? options : null;
        options = typeof options ==='function' ? {} : options;
        filename = path.isAbsolute( filename ) ? filename : path.join( require.main.path, filename );
        try{
            let data = fs.readFileSync( filename, options );
            if( cb ) cb(null, data );
            else return data;
        }
        catch(err){ cb( err, null); }    
    },
    
};

exports.File = File;
exports.Directory = Directory;