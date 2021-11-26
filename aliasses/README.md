# Aliasses

El módulo de **Aliasses** está orientado a la simplificación de rutas para la importación de módulos, es decir escribir menos y hacer más.

```js
var strCamelCase = require('../../modules/customs/Strings/CamelCase.js') // Common
var aliasCamelCase = require('#Strings/CamelCase') // Aliasses
```

Para realizar este proceso de manera sencilla, hemos decidido utilizar las mejores prácticas de otras librerías y generar un conjunto de procesos que ayude a los desarrolladores a generar alias de forma sencilla.

```js
import Aliasses from 'arcaela/aliasses'
// or Aliasses = require("arcaela/aliasses");

Aliasses.add("#Strings", "../../modules/customs/Strings");
```
Ahora podrás hacer uso de estos "alias" dentro de tu proyecto, estarías enlazando todos los documentos contenidos en **"../../modules/customs/Strings"** con las importaciones de **#Strings**.

>Es necesario tomar en cuenta que algunos alias podrían estar asociados a otros módulos npm instalados en tu proyecto.