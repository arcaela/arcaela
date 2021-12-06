<img src="../assets/banner/dark.svg">

# Strings

Con **Strings** de **arcaelas** se añaden algunas funciones útiles para el manejo de cadenas de texto.

Su implementación es sencilla:

```js
import Str from 'arcaelas/strings'
const Str = require("arcaelas/strings");
```

---
### after( text: string, pos: string | RegExp ) : string
> Sirve para extraer el texto que está posterior a un la primera coincidencia de búsqueda.

```js
Str.after("The bus use gas for run.", "us ");
// "use gas for run."
Str.after("The bus use gas for run.", /gas\s+/);
// "for run."
```

---
### afterLast(text: string, pos: string) : string
> afterLast es similar a **after()** pero solo retorna como punto de partida la última coincidencia.

```js
Str.afterLast("The bus use gas for run.", "us");
// > "e gas for run."

Str.afterLast("The bus use gas for run.", /Gas\s+/i);
// > "for run."
```

---
### before(text: string, pos: string) : string
> Si queremos obtener una cadena de texto previa a una coincidencia utilizamos **before()**.

```js
Str.before("My name is Alejandro Reyes", "Alejandro")
// "My name is "
```

---
### beforeLast(text: string, pos: string) : string
> **beforeLast()** es similar a **before()** pero utiliza como punto de quiebre la última coincidencia de búsqueda.

```js
Str.beforeLast("The bus use gas for run.", "us");
// "The bus "
```

---
### between(text: string, startAt: string, endBefore: string) : string
> Para extraer una cadena que se encuentra entre dos coincidencias, podemos utilizar **between()**.

```js
Str.between("My name is Alejandro Reyes and i'm developer.", /is\s+?/, " and");
// > "Alejandro Reyes"
```

---
### CamelCase(text: string, startLow?: bool) : string
> El método **CamelCase** es muy común durante el desarrollo, convirtiendo así la primera letra válida en mayúscula.

```js
Str.CamelCase("alejandro-reyes"); // AlejandroReyes
Str.CamelCase("alejandro_reyes"); // AlejandroReyes
Str.CamelCase("alejandro reyes"); // AlejandroReyes
Str.CamelCase("alejandro reyes", true); // alejandroReyes
```

---
### contains(text: string, ...handlers: string[]) : bool
> Verificamos si una cadena de texto coincide con una o más palabras indicadas (**handlers**).

```js
Str.contains("My dear doggy is pretty.", "dear", "big") // true
Str.contains("My dear doggy is pretty.", "black", /doggy|cat/i) // true
```

---
### containsAll(text: string, ...handlers: string[]) : bool
> Se realiza una comprobación de todas las palabras indicadas en **handlers** y retornamos **FALSE o TRUE** según corresponda.

```js
Str.containsAll("My dear doggy is pretty.", "dear", "pretty") // true
Str.containsAll("My dear doggy is pretty.", "black", /doggy|cat/i) // false
```

---
### startsWith(text: string, str: string, index: number) : bool
> La verificación de comienzo de una cadena, el primer argumento (**text**) realiza la comparación con el segundo argumento (**str**), si se especifica un indice (**index**) se realiza la búsqueda desde ese indice, por defecto es **0**.

```js
Str.startsWith("The end is begining.", "The") // true
Str.startsWith("The end is begining.", "The", 1) // false
Str.startsWith("The end is begining.", "he end", 1); // true
```

---
### endsWith(text: string, str: string, index: number) : bool
> La misma estrategia de **startsWith** se implementa aquí, pero comparando las terminaciones de la cadena principal.

```js
Str.endsWith("The end is begining.", "begining.") // true
Str.endsWith(".vimrc", "rc", 2) // false
Str.endsWith("image.gif", "gi", 1); // true
```

---
### end(text: string, shift: string) : string
> Podríamos utilizar **end()** para hacer que una cadena de texto haga su terminación con el caracter o cadena indicado.

```js
Str.end("/arcaelas/photos", "/") // /arcaelas/photos/
Str.end("/arcaelas/photos/", "/") // /arcaelas/photos/
```

---
### humanize(text: string) : string
> El método **humanize** reemplaza los caracteres "raros" a caracteres **UTF-8** comunes.

```js
Str.humanize("Kąîő-Kęń") // Kaio-Ken
```

---
### kebabCase(text: string) : string
> Construír una cadena **kebab** o **slug-case**.

```js
Str.kebabCase("my first blog url") // my-first-blog-url
Str.kebabCase("my_first_blog_url") // my-first-blog-url
```

---
### limit(text: string, max: number, union: string) : string
>Limitar la cantidad de caracteres que se deben leer de una cadena.

```js
Str.limit("The end is begining rigth now.", 5) // The e...
Str.limit("The end is begining rigth now.", 5, "... view more.") // The e... view more.
```

---
### remove(text: string, find: string) : string
> Eliminar un caracter dentro de la cadena también podría ser útil en tus desarrollos.

```js
Str.remove("The bear drink a beer with a bird.", "r")
// "The bea dink a bee with a bid."
```

---
### embed(text: string, match: string[] | RegExp[], replacer: string[]) : string
> Utilizamos **embed()** para reemplazar un caracter(es) por valores secuenciales de un arreglo.

```js
Str.embed("The school is open between ? to ?", ["10hr", "12 hr"], "?")
// "The school is open between 10hr to 12 hr"

Str.embed("The school is open between ? to ? and days ?", ["10hr", "12 hr"], "?")
// "The school is open between 10hr to 12 hr and days ?"
```

---
### reverse(text: string) : string
> Girar la cadena en reversa.

```js
Str.reverse("123456789") // 987654321
```

---
### snakeCase(text: string) : string
```js
Str.snakeCase("my dear mommy") // my_dear_mommy
```

---
### splice(text: string, start: number, end: number, replacer: string) : string
```js
Str.splice("https://github.com/brcaelas/core/String", 19, 8, "arcaelas");
// "https://github.com/arcaelas/core/String"
```

---
### start(text: string, union: string) : string
> **start()** nos permite asegurar que el comienzo de la cadena respete un formato esperado.

```js
Str.start("github.com/arcaelas/core/String", "https://");
// "https://github.com/arcaelas/core/String"
Str.start("https://github.com/arcaelas/core/String", "https://");
// "https://github.com/arcaelas/core/String"
```

---
### ucfirst(text: string) : string
```js
Str.ucfirst("my name is alejandro reyes");
// "My name is alejandro reyes"
```

---
### ucwords(text: string) : string
```js
Str.ucwords("my name is alejandro reyes");
// "My Name Is Alejandro Reyes"
```

<div style="text-align:center;margin-top:50px;">
<hr/>
<img src="../assets/footer/dark.svg" width="400px" style="margin:20px 0;">

> ¿Want to discuss any of my open source projects, or something else?Send me a direct message on [Instagram](https://instagram.com/arcaelas) or [Twitter](https://twitter.com/arcaelas).</br> If you already use these libraries and want to support us to continue development, you can sponsor us at [Github Sponsors](https://github.com/sponsors/arcaelas).
</div>