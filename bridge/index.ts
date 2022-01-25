///<reference  path="node_modules/@arcaelas/xhrequest/index.ts" />
import { Fatal, promify } from '@arcaelas/utils'
const pathToRegex = require('path-to-regex');

declare global {
    namespace Arcaela {
        namespace Bridge {
            /**
             * @description En este Bridge podemos utilizar esta interfaz para manipular o leer los datos que recibimos de la solicitud.
             */
            type RequestInit = globalThis.RequestInit & { method?: Arcaela.HTTP.Methods };
            type Request = globalThis.RequestInit & {
                url: string
                method: Arcaela.HTTP.Methods
                params: Record<string, any>
                query: URLSearchParams
            }
            interface Response {
                headers: globalThis.Headers
                bridge(executor: Promise<globalThis.Response>) : void
                send(content: BodyInit, code: number): void
                send(content: BodyInit, options: ResponseInit): void
            }
            type NextTap = ((action?: "route")=> void) | ((error?: Error | string)=> void)
            type RequestHandler = (req: Request, res: Response, next: NextTap)=> void;
            type Methods = "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch"
            type Route = Record<string, { [K in Methods]?: RequestHandler[] }>;
            type Iterators = RequestHandler[] | RequestHandler[][]
        }
    }
}


class Bridge {
    private readonly routes: [ any?, ...Arcaela.Bridge.RequestHandler[] ][] = [];
    private readonly iterators: [ any?, ...Arcaela.Bridge.RequestHandler[] ][] = [];
    /**
     * @description Agregar un manejador de solicitud para todas las solicitudes entrantes al Bridge, estos manejadores son ejecutados antes que cualquier consulta externa.
     * @example
     * // Podemos definir los headers cuando recibimos la solicitud.
     * bridge.use((req)=>{
     *  if( !req.headers.has("Authenticate"))
     *      req.headers.set("Authenticate", "Beader myencodeTokenAqui");
     * });
     * // Entonces para leer el header
     * bridge.post("/user/create", async (req, res, next)=>{
     *      // Verificamos que tenga el header
     *      if( !req.headers.has("Authenticate") )
     *          next( new Error("Se requiere autorizacion", 400) );
     *      // Usamos nuestra API privada para validar el token.
     *      else if(! await (aws.verifyToken( req.headers.get("Authenticate") )) )
     *          next("El usuario no existe", 403);
     *      // Validamos los permisos del usuario
     *      else if(! await (await aws.permissions.verify("create")) )
     *          res.status( 400 ).send({ message: "El usuario no tiene este permiso." })
     * });
     */
    use(...Iterators: Arcaela.Bridge.Iterators) : this;
    use(path:string, ...Iterators: Arcaela.Bridge.Iterators) : this;
    use(...props: any[]){
        let [ path, ...iterators] = props;
        iterators.unshift(typeof path==='string' ? new pathToRegex( path ) : path);
        this.iterators.push( iterators.flat() )
        return this;
    }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example 
     * bridge.get("/news", (req, res)=>{
     *      res.bridge( fetch("https://news.google.com/") );
     * });
     */
    get(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='GET' ? next() : next("route") ].concat( ...iterators ) ), this; }
    head(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='HEAD' ? next() : next("route") ].concat( ...iterators ) ), this; }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example 
     * bridge.post("/publish", (req, res, next)=>{
     *  if(!req.headers.has("Authenticate")) next("Se requiere un token de sesión");
     *  else next();
     * });
     */
    post(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='POST' ? next() : next("route") ].concat( ...iterators ) ), this; }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example 
     * bridge.put("/update/videos/123",{
     *  body: JSON.stringfy({ title: "Title", content:"Algun texto a enviar" })
     * }).then(res=> res.json());
     */
    put(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='PUT' ? next() : next("route") ].concat( ...iterators ) ), this; }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example 
     * bridge.delete("/videos/123").then(res=> res.json());
     */
    delete(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='DELETE' ? next() : next("route") ].concat( ...iterators ) ), this; }
    connect(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='CONNECT' ? next() : next("route") ].concat( ...iterators ) ), this; }
    options(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='OPTIONS' ? next() : next("route") ].concat( ...iterators ) ), this; }
    trace(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='TRACE' ? next() : next("route") ].concat( ...iterators ) ), this; }
    patch(path: string, ...iterators: Arcaela.Bridge.Iterators) : this { return (typeof path!=='string') ? new Fatal("type/string") : this.routes.push([ new pathToRegex( path ), (req: Arcaela.Bridge.Request, res: Arcaela.Bridge.Response, next: Arcaela.Bridge.NextTap)=>req.method==='PATCH' ? next() : next("route") ].concat( ...iterators ) ), this; }

    async fetch(url: string, init?: Arcaela.Bridge.RequestInit): Promise<Response> {
        let result: null | Promise<Response> = null;
        const request: Arcaela.Bridge.Request = { method: 'GET', ...init, url, params:null, query: new URLSearchParams, };
        const response: Arcaela.Bridge.Response = {
            headers: new Headers(),
            send(content: BodyInit, options: ResponseInit | number){
                options = typeof options!=='object' ? { status:Number( options ), headers: response.headers } : options;
                options.headers ||= response.headers;
                result = Promise.resolve(new Response(content, options));
            },
            bridge(fetcher: Promise<Response>) { result = Promise.resolve( fetcher ); },
        };
        for(let i=0;!result&&i<this.iterators.length;i++){
            const group = this.iterators[ i ];
            if(typeof group[0]!=='function'){
                if(!group[ 0 ].match( request.url )) continue;
                group.shift();
            }
            for(let handler of group){
                let status = null;
                const next: Arcaela.Bridge.NextTap = (m: any = "tap")=>{
                    if(typeof m==='string'&&!['route','tap'].includes(m)) status = new Error( m );
                    else status=m;
                };
                await handler(request, response, next);
                if( result || status==='route' ) break;
                else if(status === 'tap') continue;
                else if(status instanceof Error) response.send(status.message, 502);
                break;
            }
        }

        for(let i=0;!result&&i<this.routes.length;i++){
            const [ regex, ...routes ] = this.routes[ i ];
            let params = regex.match( url ),
                status = null,
                next: Arcaela.Bridge.NextTap = (m: any = "tap")=>(status = typeof m==='string'&&!['route','tap'].includes(m) ? new Error( m ) : m);
            if( params ) {
                request.params = params;
                for(let handler of routes){
                    await handler(request, response, next);
                    if(status instanceof Error) response.send( status.message, 502 );
                    else if(status === 'tap') continue;
                    else if( result || status==='route') break;
                }
                if( status === 'route') continue;
                else break;
            }
        }
        return result || new Response("ROUTE_NOT_FOUND", { status:404 });
    }

}


export default Bridge;