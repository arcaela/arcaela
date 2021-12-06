require("colors")
const fs = require("fs")
const path = require("path")
const http = require("https");
const spawn = require('cross-spawn');

const Logger = require("@arcaelas/logger");
const Command = require("@arcaelas/command");
const { Directory } = require("@arcaelas/fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


Command("create",{
    async action(...[,props]){
        const CWD_FOLDER = process.cwd();
        const PROJECT_FOLDER = path.resolve(CWD_FOLDER, props.argv[ 1 ]);

        if( fs.existsSync( PROJECT_FOLDER ) )
            Logger.exit("Fail: ".red.bold, path.basename( PROJECT_FOLDER ), "already exists in ", path.dirname( PROJECT_FOLDER ))

        await Directory.mkdir( PROJECT_FOLDER );
        Logger.buffer("Info: ".blue.bold+"Downloading project file list...");
        fetch("https://api.github.com/repos/arcaelas/arcaelas/git/trees/main").then(e=>e.json())
        .then(async res=>{
            console.clear();
            if( res.message ) throw new Error(res.message);

            Logger.log("Info: ".blue.bold, "Fetch files...");
            await fetch(`${ res.tree.find(p=>p.path==="app").url }?recursive=1`)
            .then(e=>e.json())
            .then(async ({ tree })=>{
                let kb = tree.reduce((a,b)=>a + (b.size||0),0);
                let sizes = { kb, progress:kb, counts:tree.length, };
                Logger.log("Info: ".blue.bold, tree.length, "files will be installed after download within", sizes.kb / 1000000, "MB");
                while(tree.length){
                    let blob = tree.shift();
                        blob.filename = blob.path;
                        blob.path = path.join( PROJECT_FOLDER, blob.filename );
                    let c = (sizes.counts - tree.length);
                    if(blob.type==='tree'){
                        Logger.buffer("(" + c + " / " + sizes.counts + ") [ "+ (c / sizes.counts * 100).toFixed(0) +"% ] - " + "Creating ".blue.bold + blob.filename);
                        await Directory.mkdir( blob.path );
                    }
                    else if(blob.type==='blob'){
                        Logger.buffer("(" + c + " / " + sizes.counts + ") [ "+ (c / sizes.counts * 100).toFixed(0) +"% ] - " + "Downloading ".yellow.bold + blob.filename);
                        await new Promise(resolve=>{
                            let stream = fs.createWriteStream( blob.path );
                            http.get(`https://raw.githubusercontent.com/arcaelas/arcaelas/main/app/${ blob.filename }`, buffer=>{
                                buffer.pipe( stream );
                                stream.on("finish", ()=>resolve( stream.close() ));
                            });
                        });
                    }
                }
                Logger.log("(" + (sizes.counts - tree.length) + " / " + sizes.counts + ") [ "+ ((sizes.counts - tree.length) / sizes.counts * 100).toFixed(0) +"% ] - "+"¡Completed!".green.bold);
            });

            // await new Promise((resolve)=>{
            //     const child = spawn("npm", ['--prefix', PROJECT_FOLDER, 'install'], {stdio:'inherit'});
            //     child.on("close", ()=>resolve())
            // });
            
            Logger.log(`\nArcaela App`.green.bold)
            Logger.log("All packages and files are installed now, you can modified the project folder:\n")
            Logger.log("[Folder]".blue, "/app".green.bold,              "|", "Folder include all middlewares, provider and Kernel config.")
            Logger.log("[Folder]".blue, "/app/middlewares".green.bold,  "|", "Many middlewares for Express.JS are includes yet.")
            Logger.log("[Folder]".blue, "/app/models".green.bold,       "|", "Some models are includes for default with some settings for easy apps.")
            Logger.log("[Folder]".blue, "/app/providers".green.bold,    "|", "The \"Providers\" files for start-up application.")
            Logger.log("[File]".blue,   "  /app/Kernel.js".green.bold,    "|", "The \"Kernel.js\" include all configuration for booting application.")
            Logger.log("");
            Logger.log("[Folder]".blue, "/config".green.bold,        "|", "Config folder for your app settings.")
            Logger.log("[File]".blue, "  /config/database".green.bold, "|", "Setting if you want include mongoose or mongodb")
            Logger.log("[File]".blue, "  /config/firebase".green.bold, "|", "Exporte Firebase \"initializedApp\" Object with the credentials.")
            Logger.log("[File]".blue, "  /config/router".green.bold,   "|", "Express.JS Router Instance.")
            Logger.log("")
            Logger.log("[Folder]".blue, "/public".green.bold, "|", "Use this folder to include yor static, asstes, images or many others files.")
            Logger.log("")
            Logger.log("[Folder]".blue, "/routes".green.bold,       "|", "The routes files.")
            Logger.log("[File]".blue, "  /routes/api".green.bold,     "|", "API Routes for Express.JS")
            Logger.log("[File]".blue, "  /routes/commands".green.bold,"|", "The commands of your project.")
            Logger.log("[File]".blue, "  /routes/web".green.bold,     "|", "Web Routes for Express.JS")
            Logger.log("")
            Logger.exit("!The next step is made your dream!".bold.underline, `\n\n         `, "Good luck!".underline.green.bold, "\n");

        })
        .catch(e=> Logger.exit("Error: ".red.bold, e.message))
    },
});