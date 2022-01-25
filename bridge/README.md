<img alt="ARCAELAS LOGO" src="../assets/banner/dark.svg" />

# Bridge

## ¿Qué significa serverless?
La computación sin servidor (o serverless para abreviar) es un modelo de ejecución en el que el proveedor en la nube (AWS, Azure o Google Cloud) es responsable de ejecutar un fragmento de código mediante la asignación dinámica de los recursos.

## ¿Como implementar servicios de Serverless?
Existen varias alternativas, entre las mas comunes tenemos:

* Firebase
* Serverless
* Google Cloud
* Microsoft Azure
* Amazon Web Services

> La documentación asociada a cada uno de estos servicios, se encuentra en el sitio oficial del los responsables.

<br> <br>

## ¿Que ventajas ofrece un Serverless?
|-|-|
|----------|---------------|
| **Ventajas** | Suministro ágil de los recursos en tiempo real, incluso en caso de picos de carga imprevisibles o un crecimiento desproporcionado	 |
| **Desventajas** | La implementación de las estructuras serverless requiere un gran esfuerzo |
<br>

## ¿Que es Bridge de Arcaelas Insiders?
Los bridge son una estructura de código que permite a los desarrolladores interceptar solicitudes y respuestas del cliente/servidor, generalmente se utilizan con servicios de **ServerLess** **(leer arriba)**.<br> 

Por este motivo **Arcaelas Insiders** se ha propuesto desarrollar de forma útil un Bridge Extensible para realizar estas tareas, las estructura implementada en nuestra librería se asemeja mucho a [**Express JS**](https://expressjs.com/es/), aún si ya conoces de la estructura de ExpressJS te recomendamos continuar la lectura de este documento.<br> <br>

## Primeros pasos
Antes de comenzar a utilizar nuestra librería será necesario instalarla: <br>
```
npm i --save @arcaelas/bridge
```
<br>
Una vez instalada requerimos importar los recursos dentro de nuestro proyecto, puedes seguir paso a paso los ejemplos a continuación si aún no conoces como importar los módulos. <br><br>

### Importación
```javascript
// CommonJS
import Bridge from '@arcaelas/bridge'
// AMD
const Bridge = require('@arcaelas/bridge');
```

### Inicialización
```javascript
const router = new Bridge();
```
<br>

Ahora bien, si queremos anexar procesadores genéricos para nuestra solicitud, podríamos utilizar el método **use()** del Objeto **router**.

Vamos a interceptar todas las solicitudes al **router** y verificando que se tenga agregado un **token** de *Autenticación* en las cabeceras de la solicitud.
```javascript
router.use((req, res, next)=>{
    // Verificamos que se haya enviado el token de sesión
    if( !req.headers.has("Authenticate") )
        next( new Error("Se requiere una sesión iniciada"), 401 );
    else next();
});
```
### Descripción del ejemplo:
* Si se envió algun token se continúa procesando la solicitud, en caso opuesto se detiene el proceso y se resuelve la solicitud con un error (*Se requiere una sesión iniciada*) y un código de [Error HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Status) ([401 - Unauthorized](https://developer.mozilla.org/es/docs/Web/HTTP/Status/401)).

* El código de error es opcional, podríamos no incluirlo (por defecto es [502 - Bad Gateway](https://developer.mozilla.org/es/docs/Web/HTTP/Status/502)).
* El error enviado a travéz de la función **next()** podría ser de tipo **string** siempre y cuando sea distinto a **tap** y **route**.
* Llamamos **next()** al fallar la verificación, esto se debe a que los **bridge** interceptan las solicitudes solo **una vez** para evitar [bucles infinitos](https://es.javascript.info/while-for) o [errores de memoria](https://developer.mozilla.org/es/docs/Web/JavaScript/Memory_Management)
* Tener en cuenta que llamar la función **next()** **NO** detiene el progreso de la función, esto quiere decir que el código después de **next()** se sigue leyendo, para evitar el progreso de la función se recomienda utilizar `return next();` en caso de ser necesario.<br><br><br>

Asumiendo que nuestro router posee un [**CRUD** de productos](https://es.wikipedia.org/wiki/CRUD), vamos a incluír el siguiente código como ejemplo:
```javascript
// Si tienes el ejemplo anterior incluído en tu código ya no será necesario verificar la sesión.
router.post("/products", (req, res, next)=>{
    const db = window.localStorage;
    const products = JSON.parse(db.getItem("products") || '[]');

    /* No realizamos esta conversión de datos de forma automática debido a ciertas incompatibilidades con los posibles valores de BodyInit, pero en un futuro no muy lejano agregaremos más funcionalidades. */
    if( req.headers.get("content-type") === 'multipart/form-data' ){
        let b={};
        for(let [k, v] of req.body) b[ k ] = v;
        req.body = b;
    }

    // Almacenamos el producto en nuesta lista.
    products.push({
        // ID autoincrementable en base a los productos almacenados
        id: products.length,
        ... req.body,
    });
    
    db.setItem("products", JSON.stringify( products) );
    res.send({
        data:"Producto almacenado"
    }, 200); // Código de respuesta es opcional

    /*Tambien podríamos utilizar next("Almacenado", 200); */
});
```
* Nuestro **router** ahora tiene un bridge en las rutas */products* siempre que sean [*POST*](https://developer.mozilla.org/es/docs/Web/HTTP/Methods/POST).
* Estamos utilizando [localStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage) como nuestru administrador de Base de Datos.
* Debido a que nuestra librería no modifica el cuerpo de la solicitud ni sus cabeceras de forma atomatica, es necesario modificarla manualmente.
* Generamos un ID en base a la cantidad de productos que se tienen almacenados e incluimos el producto en nuestra lista de productos.
* Guardamos la lista en la ["base de datos"](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
* Resolvemos la solicitud al cliente con un cuerpo **{ data:(...) }** y un [Codigo HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Status) de clase [200 - Success](https://developer.mozilla.org/es/docs/Web/HTTP/Status/200).

<br> <br> <br>

Perfecto, hasta ahora hemos aprendido a interceptar las solicitudes y procesarlas. <br>
Pero... ¿De que sirve procesar solicitudes que no son enviadas?, vamos a realizar algunas solicitudes a nuestro [Bridge](https://npmjs.com/package/@arcaelas/bridge).

```javascript
router.fetch("/products",{
    method:"POST",
    body: JSON.stringfy({
        price: 19.07,
        title:"CannedHead is Better",
        description: "Descripción de mi producto.",
    }),
})
.then(async res=>{
    if( res.ok ) return res.json(); // Convertimos la respuesta a formato JSON
    throw new Error( await res.text() ); // Enviamos un error en caso de existir alguno.
})
.then(response=>{
    if( response.data ) alert("El producto fué almacenado.");
    else alert("Ups! Tuvimos un problema al almacenar el producto.");
})
.catch(err=> alert( err.message ))
```
* Realizaos una solicitud a nuestro router, como cualquier solicitud Fetch.
* Enviamos nuestro cuerpo del producto.
* Analizamos la respuesta recibida y la convertimos a JSON en caso de ser posible.
* Si el producto se almacenó, mostramos una alerta en el navegador.

<br> <br> <br>
Estos son solo algunos de los posibles usos de la librería, en breve estaremos anexando más ejemplos de las funcionalidades y los alcances de la librería.


<div style="text-align:center;margin-top:50px;">
<hr/>
<img src="../assets/footer/dark.svg" width="400px" style="margin:20px 0;">

> ¿Want to discuss any of my open source projects, or something else?Send me a direct message on [Instagram](https://instagram.com/arcaelas) or [Twitter](https://twitter.com/arcaelas).</br> If you already use these libraries and want to support us to continue development, you can sponsor us at [Github Sponsors](https://github.com/sponsors/arcaelas).
</div>