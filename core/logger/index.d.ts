declare global {
    namespace Arcaela {
        module logger {
            /**
             * @description Clear Console
             */
            function clean() : void
            
            /**
             * @description Print some text into console
             */
            function log(text: string[]) : void
    
            /**
             * @description Print temporary text in console as loader.
             * @example
             * for(let task of tasks){
             *  buffer(task.name);
             *  await task.call();
             * }
             */
            function buffer(text: string) : void
    
            /**
             * @description Print yellow texts in console.
             */
            function warn(text: string[]) : void
    
            /**
             * @description Print text and Exit.
             */
            function exit(text: string[]) : never
    
            /**
             * @description Print red text in console.
             */
            function error(text: string[]) : void
    
            /**
             * @description Print green text in console.
             */
            function success(text: string[]) : void
        }
    }
}


export = Arcaela.logger