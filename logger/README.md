# Logger

Con el **Logger** de **arcaela** podrémos hacer uso de nuestras consolas de forma versátil, ya sea en nuestro terminal o navegador.

> En teoría el módulo **Logger** solo anexa algunas funciones extras a "console".

Su implementación es sencilla.
```js
import Logger from 'arcaela/logger'
// or
var Logger = require('arcaela/logger') // Logger instance
```
Podríamos imprimir un mensaje en la consola o terminal:
```js
Logger.log("¡Hello!");
```
`output >> "¡Hello!"`

Esto no es muy útil dentro de la librería, pero podríamos hacer algunas otras acciones como:

**buffer(text?: string)**
```js
Logger.buffer("¡Hello"); // Esto escribe un texto en la terminal (o concola).
Logger.buffer("World!"); // Esto sobrescribe el texto en la terminal.
```

**error(... any[])**
```js
Logger.error("Ups!"); // Imprime Ups! en color rojo.
Logger.error("Warning", "with Joe!"); // Imprime "Warning" "with Joe!" en color rojo.
```

**warn(... any[])** 
> Es un alias para error/log, pero imprime los mensajes en color amarillo.

**success(... any[])** 
> Es un alias para error/log, pero imprime los mensajes en color verde.

**exit(... any[])** 
> Imprime el mensaje en la cónsola y finaliza el proceso en caso de estar en una terminal.
