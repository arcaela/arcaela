#!/usr/bin/env node

require("colors");
require("./command");
const Command = require("@arcaela/command");

(function(){
    const fs = require("fs");
    const cwd = process.cwd();
    const path = require("path");
    const command = Command.find(e=>e.props.name===process.argv[ 2 ])

    if( command ) return command.exec(
        process.argv.slice(2)
    );

    let packet = path.join( cwd, 'package.json' );
        packet = fs.existsSync( packet ) ? require( packet ) : null;
    let main = packet?.main && path.join(cwd, packet.main);

    if(!packet)
        Logger.exit("\nFail: ".yellow.bold, "Please run this command in a", "npm".green ," project.\n")
    else if(!('@arcaela/command' in packet.dependencies))
        Logger.exit("\nFail: ".yellow.bold, "Please install","@arcaela/command".green,"before run this command.\n")
    else if(!main || !fs.existsSync( main ))
        Logger.exit("\nFail: ".yellow.bold, "This project dont have main file.", "\n")

    require( main );
})();


