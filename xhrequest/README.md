<img src="../assets/banner/dark.svg">

# XHRequest

## ¿Que és?
Al igual que otras librerías de código abierto como "axios" y "ajax", **XHRequest** también es utilizada para las solicitudes asícronas a un servidor.

## ¿Que ventajas posee?
En esencia podríamos decir que se trata de solo un almacenador de datos, donde son guardados todos los meta-datos de la solicitud, para luego ser procesados por el manejador, en este caso los manejadores pueden ser personalizados o instalados de algún repositorio o paquete de **npm.**

## Propiedades

* **request**: Se trata del objeto cuyo contenido son los campos y headers que serán procesados.
    * **url**: Url destino.
    * **headers**: Cabezeras de petición, este campo debe ser un Objeto JSON, pero al ser enviado al driver, se convierte en una instancia de "Headers".
    * **inputs**: Objeto Key/Value con el cuerpo de datos.
    * **files**: Objeto Key/Value con los archivos a ser procesados, las claves siempre serán de tipo **string** mientras que su valor, puede variar entre **string, number, Blob, File, Array**.
    * **method:**: Cabezera que indica el tipo de método a ser utilizado.


* **options**: Aqui almacenamos datos útiles como los listeners, drivers, opciones de caché, etc.
    * **events**: Objeto Clave/Valor con los eventos agregados.
    * **drivers**: Objeto Clave/Valor con los drivers agregados.
    * **cache**: Booleano con el estado de caché especificado.


## Uso

Podríamos asumir que deseas realizar consultas periodicas a una API, el ejemplo sencillo para ello sería:

```js
import XHRequest from '@arcaelas/xhrequest'

const request = new XHRequest("https://api.github.com/users/arcaelas");
setInterval(()=>{
    request.then((json, response)=>{
        document.querySelector(".display-name")?.innerHTML = json.name;
    });
}, 50000); // Cada 50 segundos

// or

const request = new XHRequest();
setInterval(()=>{
    request.url("https://api.github.com/users/arcaelas").then((json, response)=>{
        document.querySelector(".display-name")?.innerHTML = json.name;
    });
}, 50000); // Cada 50 segundos

```

El ejemplo anterior es solo una práctica simple de solicitudes a un servidor, pero si en cambio quisieramos especificar las cabezeras que deben ser enviadas, podríamos hacer lo siguiente:

```js
const request = new XHRequest("https://api.github.com/users/arcaelas", {
    headers:{
        "Content-Type": "application/json; charset=utf-8"
    }
});

//or
request.header({
    "Content-Type": "application/json; charset=utf-8"
});

//or
request.header("Content-Type", "application/json; charset=utf-8");
```

Las solicitudes básicas son de uso cotidiano para cada desarrollador, pero ahora necesitaremos hacer uso de los campos de nuestra solicitud:

```ts
const request = new XHRequest(url, {
    inputs:{
        username:"arcaelas",
        passowrd:"secret"
    },
});
//or
request.input({
    username:"arcaelas",
    passowrd:"secret"
});
//or
request.input("username", "arcaelas");
//or
request.input(new FormData, overwrite?: boolean);
//or
request.input(new URLSearchParams, overwrite?: boolean);
//or
request.input("?username=arcaelas&passowrd=secret");
```

Hasta ahora no hemos visto mucho de como implementar nuestras solicitudes, pero desde la versión *1.2.0* se agregó el uso de **HTMLElement**.
```js
request.input( document.querySelector("[name=username]") )
//or
request.input("passowrd", document.querySelector("[name=mysecret]") )
```


## Archivos

Los ejemplos de envío de archivos, son muy similares al uso de **input**, solo debes especificar el campo del archivo.

```ts
const request = new XHRequest("", {
    files: {},
});
//or
request.file("picture", new File);
//or
request.file( document.querySelector("[type=file]") );
//or
request.file("gallery", document.querySelector("[type=file]").files );
```

## Helpers


### **merge**
> Combinamos propiedades dentro de nuestra solicitud.
```ts
request.merge(new URL); // target url
request.merge(new Headers); // target headers
request.merge(new FormData); // target input
request.merge(new URLSearchParams); // target input
request.merge("input", new URLSearchParams); // target input
request.merge("files", {
    picture: new File
}); // merge file
```

### **on**
> Agregamos listeners a nuestra solicitud:
```ts
// Antes de enviar la solicitud
request.on("before", (request: RequestInit, options: Options)=>{
    request.headers.set("content-type", "multipart/form-dat");
});
// Respuesta exitosa
request.on("success", (response: Response)=>{
    return response.json();    
});
// Error
request.on("error", (err: Error)=>{
    if(err.statusText==='')
        return new Error("Undefined Error!");
    return err;
});
```



> ## No todos los métodos y propiedades están documentados aquí, pero estamos en el constante desarrollo de nuevas prácticas.



<div style="text-align:center;margin-top:50px;">
<hr/>
<img src="../assets/footer/dark.svg" width="400px" style="margin:20px 0;">

> ¿Want to discuss any of my open source projects, or something else?Send me a direct message on [Instagram](https://instagram.com/arcaelas) or [Twitter](https://twitter.com/arcaelas).</br> If you already use these libraries and want to support us to continue development, you can sponsor us at [Github Sponsors](https://github.com/sponsors/arcaelas).
</div>