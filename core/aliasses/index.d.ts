declare global {

    namespace Arcaela {
        module aliasses {
            function reset() : void
            function init(options? : { base: string }) : void
            function add(name: string, target: string) : void
            function merge(alias: {[x: string]: string}) : void
        }
    }

}


export = Arcaela.aliasses;