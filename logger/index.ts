import 'colors';
declare global {
    namespace Arcaela {
        interface logger {
            clean(): void
            buffer(text: string): void
            log(...text: string[]): void
            exit(...text: string[]): void
            warn(...text: string[]): void
            error(...text: string[]): void
            success(...text: string[]): void
        }
    }
}


if(typeof process ==='undefined'){
    const process = {};
}
const logger : Arcaela.logger = {
    clean(){
        process.stdout?.clearLine(-1, ()=>{
            process.stdout?.cursorTo(0);
        });
    },
    buffer(text=''){
        this.clean();
        process.stdout?.write( text ) || console.log( text );
    },
    log(...text){
        this.clean();
        console.log(...text);
    },
    error(...text){
        this.log(...text.map(e=> typeof e==='string' ? e.red : e) );
    },
    warn(...text){
        this.log(...text.map(e=> typeof e==='string' ? e.yellow : e) );
    },
    success(...text){
        this.log(...text.map(e=> typeof e==='string' ? e.green : e) );
    },
    exit(...text){
        this.log(...text);
        process?.exit();
    }    
};

export = logger;