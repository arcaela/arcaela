const _ = require('lodash');
const logger = require('@arcaela/logger');

function parseOptions(options = {}, argv=[]){
    let params = { args:{}, argv:[], options:{}, }, last;
    params.argv = (argv||[]).map(str=>str.match(/[^\s]\s[^\s]/g)?`"${str}"`:str).join(" ").match(/^-[-a-z]+|\'[^']+'|\"[^"]+\"|[^\s]+/g)||[];
    for(let key of params.argv){
        let short = key.split(/^-([a-z]+)/g)[1]?.split("");
        if( short?.length===1 ) params.args[ last = short[0] ] = [];
        else if( short?.length ) for(let k of short) params.args[ k ] = [];
        else if( hd = key.match(/^--(\w+)/) ) params.args[ last = hd[1] ] = [];
        else if( last ) params.args[ last ].push( key.replace(/^("(.*)"|'(.*)')$/g,"$2$3") );
    }
    for(let key in options){
        let option = options[ key ];
        if( typeof option!=='object' || Array.isArray(option) ){
            params.options[ key ] = option;
            continue;
        }
        option = { macros:[], value:null, type: Boolean, ...option};
        let value = 'static' in option ? [ option.static ] : (
            params.args[ key ]?.length ? params.args[ key ] : (
                [(option.macros?.find(m=>m.k in params.args)||{v:'value' in option?option.value:true}).v]
            )
        );
        params.options[ key ] = Array.prototype===option.type?.prototype?new option.type(...value):option.type(value[0]);
        delete params.args[ key ];
    }
    return params;
};

function command(name="", ...props){
    name = String( name ).replace(/[^a-zA-Z:_-]+/gi,'');
    if(!props.length) return commands[ name ];
    const $events = {
        before:[],
        after:[],
    };

    return commands[ name ] = {
        get name(){ return name; },
        get usage(){ return props[0]?.usage || ""; },
        get options(){ return props[0]?.options || {}; },
        get before(){
            return executor=>{
                if( typeof executor==='function'){
                    $events.before.push( executor );
                    return ()=>$events.before.splice( $events.before.findIndex(fn=> fn===executor), 1 );
                }
                return ()=>{};
            };
        },
        get after(){
            return executor=>{
                if( typeof executor==='function'){
                    $events.after.push( executor );
                    return ()=>$events.after.splice( $events.after.findIndex(fn=> fn===executor), 1 );
                }
                return ()=>{};
            };
        },
        get exec(){
            return async (argv=[])=>{
                const params = parseOptions( this.options, argv);
                if(params.argv.some(a=>['-h','--help'].includes(a))){
                    logger.log(`Arcaela CLI`.green.bold, ("(Servidores construídos en "+"NodeJS".green+")").bold )
                    logger.log("command:".yellow.bold, `${this.name}`.green )
                    logger.log("Usage:".yellow.bold, this.usage )
                    logger.log("Options:".yellow.bold)
                    for(let k in this.options){
                        let option = this.options[ k ];
                        logger.log(` --${k}`);
                        logger.log(`  Type: `.bold.green, (option.type || Boolean)?.name);
                        logger.log(`  Value: `.bold.green, 'static' in option ? option.static: option.value);
                    }
                    return;
                }
                await _.over( _.values(this.$events.before) )( params.options, params );
                if(typeof props.action==='function')
                    await props.action(params.options, params);
                await _.over( _.values(this.$events.after) )( params.options, params );
                return this;
            };
        },
    };
};

const commands = {
    help:{
        name:'help',
        action: command.help(),
    },
};

command.find = (executor)=>_.values(commands).find(executor);
command.exec = async (name, argv=process.argv.slice(2))=>(commands[name]||{exec:()=>null}).exec( argv );
command.help = function(){
    logger.log(`Arcaela CLI`.green.bold, ("( Servidores construídos en "+"NodeJS".green+" )").bold )
    logger.warn(`Available commands:`);
    for(let name in commands){
        let command = commands[ name ];
        logger.log("command:".yellow.bold, `${command.name}`.green );
        logger.log("Usage:".yellow.bold, command.usage )
        logger.log("Options:".yellow.bold)
        for(let k in command.options){
            let option = command.options[ k ];
            logger.log(` --${k}`);
            logger.log(`  Type: `.bold.green, (option.type || Boolean)?.name);
            logger.log(`  Value: `.bold.green, 'static' in option ? option.static: option.value);
        }
        logger.log("\n");
    }
};
command.all = ()=>commands;


module.exports = command;