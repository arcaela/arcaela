// Type definitions for Arcaela 2.2
// Project: https://github.com/arcaela/arcaela/core
// Definitions by: arcaela <https://github.com/arcaela>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
import * as glob from 'glob';
import * as node_fs from 'fs';

declare global {
    namespace Arcaela {
        namespace fs {
            interface Directory {
                /**
                * @example
                * Directory.match("./*.js").forEach(basename=> { console.log( basename ); })
                *
                * @param {string[]} patterns - Pattern or array patterns with select files or folders.
                * @param {glob.IOptions} options - Documentations for options in [Glob]{@link https://www.npmjs.com/package/glob}
                * @returns {string[]}
                */
                match(patterns?:string[], options?: glob.IOptions): string[];
    
                /**
                * @description Create Directory with specified attributes.
                * @example
                * Directory.mkdir(`/home/${ username }/photos`)
                * @param {string} target - Path that will be created
                * @param {node_fs.MakeDirectoryOptions} options - Mkdir Options as well as {@link node_fs.MakeDirectoryOptions}
                * @returns {string} - Target Returned
                */
                mkdir(target?:string, options?: node_fs.MakeDirectoryOptions): string;
                
                /**
                * @description Copy Directory & Files using Glob Pattern
                * @example
                * Directory.copy("./*.js", "./public/dist/")
                *
                * Directory.copy(["./*.js", "/webpack/css/*.css"], "./public/dist/", { flat: true })
                * @param {string | string[]} patterns - Pattern or array patterns with select files or folders.
                * @param {string} target - String with target.
                * @param {glob.IOptions} options - Documentations for options in [Glob]{@link https://www.npmjs.com/package/glob}
                */
                copy(patterns ? : string | string[], target ? : string, options ? : glob.IOptions): {
                    success:{src: string, target: string}[],
                    error:{src: string, target: string, error: Error}[]
                };
    
                /**
                * @description Move directories using a glob pattern.
                * @param {string[]} patterns - Glob patterns to find directories
                * @param {string} target - Destinity
                * @param {{ overwrite: boolean }} options - Options for move or rename Directories
                * @returns
                */
                move(patterns ? : string[], target ? : string, options?: {overwrite:boolean}): {
                    success: {origin: string, destinity:string }[];
                    error: {origin: string, destinity:string, error: Error }[];
                };
    
                /**
                 * @description Alias for Directory Move
                 * @param {string[]} patterns - Glob patterns to find directories
                 * @param {string} target - Destinity
                 * @param {{ overwrite: boolean }} options - Options for move or rename Directories
                 * @returns {{success:{src: string, target: string}[], error:{src: string, target: string, error: Error}[]}}
                 */
                rename(patterns ? : string[], target ? : string, options?: {overwrite:boolean}): {
                    success: {origin: string, destinity:string }[];
                    error: {origin: string, destinity:string, error: Error }[];
                };
                
                /**
                * @description
                * @param {string|string[]} patterns 
                * @param {glob.IOptions} options 
                * @returns {{success:{src: string}[], error:{src: string, error: Error}[]}}
                */
                unlink(patterns: string[], options: glob.IOptions) : {
                    success:{src: string}[],
                    error:{src: string, error: Error}[]
                }
            }
            
            interface File {
                /**
                * @description Alias for Directory Unlink
                * @param {string|string[]} patterns
                * @param {glob.IOptions} options
                */
                unlink(patterns: string | string[], options: glob.IOptions) : never
                            
                /**
                 * @description Create file dinamically
                 * @param {node_fs.PathOrFileDescriptor} filename - Path to locate file
                 * @param {string | NodeJS.ArrayBufferView} content - Content to put into file.
                 * @param {node_fs.WriteFileOptions | ((filename: string)=> void) } type 
                 * @param {(filename: string)=> void} cb 
                 * @returns {never}
                 */
                write(
                    filename: node_fs.PathOrFileDescriptor,
                    content: string | NodeJS.ArrayBufferView,
                    type: node_fs.WriteFileOptions | ((filename: string)=> void),
                    cb: ((filename: string)=> void)
                ) : never
                
                /**
                 * @description Read file sync, use this for sync functions only.
                 * @param {node_fs.PathOrFileDescriptor} filename 
                 * @param {BufferEncoding | { encoding?: null | undefined; flag?: string | undefined; }} options 
                 * @param {(err: Error | null, data: Buffer)=> void} cb 
                 * @returns {Buffer | undefined}
                 */
                read(
                    filename: node_fs.PathOrFileDescriptor,
                    options: BufferEncoding | { encoding?: null | undefined; flag?: string | undefined; },
                    cb: ((err: Error | null, data: Buffer)=> void)
                ) : Buffer | undefined
            }
        }
    }
}

export const File : Arcaela.fs.File;
export const Directory : Arcaela.fs.Directory;