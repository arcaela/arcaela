require('colors');
const logger = {
    clean(){
        process.stdout?.clearLine();
        process.stdout?.cursorTo(0);
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
module.exports = logger;