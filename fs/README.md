# FileSystem

**FS** no posee funciones u expectativas distintas a los manejadores de archivos comunes, incluso esto se presenta como una versión **BETA** de este manejador y  ***Todos***  sus métodos son **Sícronos**.

Su implementación es sencilla:

```js
import { Directory, File } from 'arcaela/fs'
const { Directory, File } = require("arcaela/fs");
```


## Directory
> Conoceremos el módulo de Directory el cual administra las tareas orientadas al manejo de carpetas y algunas funciones de archivos.

---
### match(glob: string[], options: object) : string[]
> Con un patrón global o específicos, podríamos listar los archivos y directorios dentro de rutas específicas o genéricas.

```js
Directory.match("./*.js") // Al JS files in current directory
Directory.match("./**/*.js") // Al JS files in recursive directory.
```

---
### mkdir(path: string, options: [fs.MakeDirectoryOptions](https://nodejs.org/api/fs.html#fspromisesmkdirpath-options) ) : string[]
> Creación de directorios **Sync** con posibilidades recursivas.

```js
Directory.mkdir("./profiles/arcaela/photos/")
fs.mkdir("./profiles/arcaela/photos/", {
    recursive:true
})
```

---
### copy(globs: string[], target: string, options: object ) : object
> Copiar archivos y directorios de forma recursiva.

```js
Directory.copy("./profiles/**/photos/", "/backups/")
```

---
### move(globs: string[], target: string, options: object ) : object
> Mover archivos y directorios de forma recursiva.

```js
Directory.move("./profiles/**/photos/", "/backups/")
```

---
### rename(globs: string[], target: string, options: object ) : object
> Alias para **move()**.

```js
Directory.rename("./profiles/**/photos/", "/backups/")
```

---
### unlink(globs: string[], options: object ) : object
> Eliminar archivos y directorios de forma recursiva.

```js
Directory.unlink("./profiles/**/photos/")
Directory.unlink(["./profiles/**/photos/"])
```

## File
> El módulo de **File** administra funciones similares.

---
### unlink(glob: string[], options: object) : string[]
> Alias para **Directory.unlink**

---
### read(filename: string, options: object, cb?: function) : Buffer
> Leer archivos con un callback de forma sicrona.

```js
File.read("/config/database.json", "utf8", (err, data)=>{
    if(err) return;
    console.log( data );
})
```

---
### write(filename: string, options: object, cb?: function) : Buffer
> Escribir archivos con un callback de forma sicrona.

```js
File.write("/config/database.json", "{ \"username\":\"root\" }");
// or
File.write("/config/database.json", ()=>{
    return { username:"root" };
})
// or
File.write("/config/database.json", { username:"root" }, (err)=>{
    if(err) throw err;
    console.log("Saved");
})
```
