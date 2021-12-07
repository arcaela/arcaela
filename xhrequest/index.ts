import { Fatal } from "@arcaelas/utils/Errors"
declare global {
    namespace Arcaela {
        namespace HTTP {
            /**
             * @description All HTTP Methods
             */
            type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH"
            
            /**
             * @description All valid Cache-Control
             */
            type CacheControl = RequestCache | "must-revalidate" | "no-transform" | "public" | "private" | "proxy-revalidate" | `max-age=${number}` | `s-maxage=${number}`

            /**
             * @description All common HTTP headers
             */
            type Headers = {
                "Accept-Ranges" : any
                "Access-Control-Allow-Credentials": boolean | string
                "Access-Control-Allow-Headers": string | []
                "Access-Control-Allow-Methods": Methods | `${Methods},${string}`
                "Access-Control-Allow-Origin" : any
                "Access-Control-Expose-Headers": string | []
                "Access-Control-Max-Age": number
                "Age": number
                "Allow": Methods | `${Methods},${string}`
                "Alternate-Protocol" : any
                "Cache-Control": CacheControl
                "Client-Date" : any
                "Client-Peer" : any
                "Client-Response-Num" : any
                "Connection" : any
                "Content-Disposition" : any
                "Content-Encoding" : any
                "Content-Language" : any
                "Content-Length": number
                "Content-Location" : any
                "Content-MD5" : any
                "Content-Range" : any
                "Content-Security-Policy-Report-Only" : any
                "Content-Security-Policy, X-Content-Security-Policy, X-WebKit-CSP" : any
                "Content-Type" : any
                "Date" : any
                "ETag" : any
                "Expires": Date | number | string
                "HTTP" : any
                "Keep-Alive" : any
                "Last-Modified" : any
                "Link" : any
                "Location" : any
                "P3P" : any
                "Pragma": "no-cache"
                "Proxy-Authenticate" : any
                "Proxy-Connection" : any
                "Refresh" : any
                "Retry-After" : any
                "Server" : any
                "Set-Cookie" : any
                "Status" : any
                "Strict-Transport-Security" : any
                "Timing-Allow-Origin" : any
                "Trailer" : any
                "Transfer-Encoding" : any
                "Upgrade" : any
                "UserAgent" : string
                "Vary" : any
                "Via" : any
                "Warning" : any
                "WWW-Authenticate" : any
                "X-Aspnet-Version" : any
                "X-Content-Type-Options" : any
                "X-Frame-Options" : any
                "X-Permitted-Cross-Domain-Policies" : any
                "X-Pingback" : any
                "X-Powered-By" : any
                "X-Robots-Tag" : any
                "X-UA-Compatible" : any
                "X-XSS-Protection": any
            }
        }
        namespace XHRequest {
            /**
             * @description Defaults values for object with key/value
             */
            type BasicValues = object | string | number | boolean | (string | number | boolean)[]
            /**
             * @description Append some value to Object
             * @param {BasicValues} A
             */
            type ObjectWith<A = BasicValues> = Record<string|number, A extends BasicValues ? A : (BasicValues | A)>
            /**
             * @description Create Object with only specified values.
             */
            type ObjectOnly<B extends any> = Record<string|number, B>
            /**
             * @description Valid values for input request
             */
            type Inputs = string | URLSearchParams | FormData | ObjectWith;
            /**
             * @description Valid values for Files input request.
             */
            type Binary = File | FileList | Blob | BufferSource | ReadableStream<Uint8Array>
            /**
             * @description Valid Headers values for haders inputs request.
             */
            type Headers = globalThis.Headers | ObjectOnly<number | string | []> & { [K in keyof HTTP.Headers]?: HTTP.Headers[K] };
            /**
             * @description Default events for Listeners of request.
             */
            interface EventListener {
                before<R extends RequestInit, O extends Options>(req: R, opt: O) : void;
                success<R extends Response>(res: R) : R;
                error(err: Error) : Promise<any>;
            }
            /**
             * @description Driver manager for intercept request and evaluate response.
             * @description Alias for {@link EventListener.before}
             */
            type Driver = (req: RequestInit, opt: Options)=> Promise<Request>;
            /**
             * @description RequestInit is object with request configurations self, this object is passed to {@link Driver}
             */
            type RequestInit = { [K in keyof globalThis.RequestInit]?: globalThis.RequestInit[K] } & {
                url?: string
                headers?: Headers
                /**
                 * @deprecated
                 * This property is deprecated in the class, but in its case you can use {@link RequestInit.inputs "inputs"}.
                 */
                body?: any
                /**
                 * @description Use this property for send JSON or FormData
                 * Note: No use for Files, use files with File | FileList | Blob ...
                 * @example
                 * inputs: new FormData()
                 * inputs: "username=arcaelas&password=******"
                 * inputs: { username:"arcaelas" }
                 */                
                inputs?: Record<string|number, BasicValues>
                /**
                 * Files is used to send files or Blobs to Server, use Key/value structure.
                 * @example
                 * files: {
                 *  "profile": document.querySelector("#myPicture"),
                 *  "uploads": document.querySelector("#multi_files").files,
                 *  "mp4": document.querySelector("#multi_files").files[ 0 ],
                 *  "README.md": new Blob(["## Title\n> subtitle"], { type:"text/markdown"})
                 * }
                 * 
                 * // or
                 * files: document.querySelector("#myPicture")
                 */
                files?: Record<string|number, string | Blob | File[]>
                method: HTTP.Methods
            }
            type Options = {
                /**
                 * @description List of listener events for the events in the request.
                 */
                events: {
                    [K in keyof EventListener]: EventListener[ K ][]
                }
                cache: number
                /**
                 * @description Name of the active "driver" available to make the request.
                 */
                driver : string
                /**
                 * @description List with names of the "drivers" available to make requests.
                 */
                drivers : Record<string, (req: RequestInit, opt: Options)=> Promise<Response> >
            }
        }
    }
}

/**
 * @class
 */
class XHRequest {
    private request : Arcaela.XHRequest.RequestInit = {
        method: "GET",
    }
    private options : Arcaela.XHRequest.Options = {
        driver:'fetch',
        drivers:{},
        cache: -1,
        events:{
            before:[],
            success:[],
            error:[],
        },
    }
    /**
     * @constructor
     * @description Initiate XHRequest
     */
    constructor(url?: string, request?: Arcaela.XHRequest.RequestInit){
        this.url(url).merge( request );
    }
    _domain: string = window.location.origin
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHR.domain("https://api.example.com/"); // Set domain
     */
    static domain(domain: string | URL) : void {
        XHRequest.prototype._domain = domain instanceof URL ? domain.toString() : ((
            typeof domain==='string' && domain.match(/^[a-z0-9]+\:\/\//)
        ) ? domain : window.location.origin);
    }
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHR.domain("https://api.example.com/"); // Set domain
     */
    public domain(domain: string | URL) : this {
        this._domain = domain instanceof URL ? domain.toString() : ((
            typeof domain==='string' && domain.match(/^[a-z0-9]+\:\/\//)
        ) ? domain : window.location.origin);
        return this;
    }
    /**
     * @description Use this method to define the url that will be used in the request,
     * if the url does not include a specified server or protocol,
     * the url or "end point" will be concatenated with the domain that has been specified.
     * @example
     * var req = new XHR();
     * 
     * //Send to https://api.example.com/user/8264
     * req.url("/user/8264")
     * 
     * //Send to https://pay.site.com/checkout/12
     * req.url("https://pay.site.com/checkout/12")
     */
    public url(url: string | URL) : this;
    public url(url) {
        this.request.url = url instanceof URL ? url.toString() : (
            (typeof url==="string" && !url.match(/^(\/\/)?[a-zA-Z0-9]+\:/)) ? this._domain.concat(url) : url
        );
        return this;
    }
    /**
     * @description This method specifies the "method" header for the request.
     * @example
     * var req = new XHR();
     * req.method("PUT"); // POST GET PUT DELETE OPTIONS HEAD CONNECT TRACE PATCH
     */
    public method(method: Arcaela.HTTP.Methods) : this;
    public method(method){
        this.request.method = method;
        return this;
    }
    /**
     * @description We are going to configure the headers that are sent in the request, either with common or custom headers.
     * @example 
     * req.headers( new Headers() ) // define Content-Type
     * req.headers( "Content-Type", "application/json" ) // define Content-Type
     * req.headers({
     *  "Content-Type":"application/json",
     *  "Allow-Methods":"POST,GET"
     * }) // define multiple Headers
     */
    public header(headers: Arcaela.XHRequest.Headers, overwrite?: boolean) : this
    public header<K extends keyof Arcaela.HTTP.Headers, V extends Arcaela.HTTP.Headers[ K ]>(key:K, v: V) : this;
    public header(...props: any[]){
        let [ key, value = false ] = props;
        if(typeof key==="object"){
            if(value===true) this.request.headers = {};
            if(key instanceof Headers) key.forEach((v,k,h)=> this.request.headers[ k ] = h.get(k));
            else Object.assign(this.request.headers, key);
        } else if(key === "string")
            this.request.headers[ key ] = value;
        return this;
    }
    /**
     * @description Append Key/Value from JSON, INPUT or Key/Value
     * @example
     * // Set input request with "INPUT name attr" and value.
     * req.input( document.getElementById("username") )
     * 
     * // Set input request with "myCustomKey" and value.
     * req.input("myCustomKey", document.getElementById("username") )
     * 
     * // Set input request as { username:"arcaelas" }
     * req.input({"username":"arcaelas"})
     * 
     * // Set input request as { username:"arcaelas" }
     * req.input("username", "arcaelas")
     */
    public input(input: HTMLInputElement): this;
    public input(key: string, input: HTMLInputElement):this;
    public input(form: FormData, overwrite?: boolean): this;
    public input(queryString: string | URLSearchParams, overwrite?: boolean): this;
    public input(key: string | number, value: Arcaela.XHRequest.BasicValues): this;
    public input(inputs: Arcaela.XHRequest.ObjectWith): this;
    public input(...props: any[]){
        let [ key, value = false ] = props;
        if(key instanceof HTMLInputElement){
            if(key.type==='file') return this.file( key );
            this.request.inputs[ key.name ] = key.type==="checkbox" ? key.checked : key.value;
        } else if(typeof key==='string' && value instanceof HTMLInputElement){
            if(value.type==='file') return this.file(key, value);
            this.request.inputs[ key ] = value.type==="checkbox" ? value.checked : value.value;
        } else if(key instanceof FormData){
            let object = {};
            key.forEach((v,k)=> object[ k ] = k in object ? [].concat(object[k], v) : v);
            if(value===true) this.request.inputs = object;
            else Object.assign(this.request.inputs, object);
        } else if(key instanceof URLSearchParams || (props.length===1 && typeof key==="string")){
            let object = {};
            (new URLSearchParams( key )).forEach((v,k)=> object[k] = v);
            if(value===true) this.request.inputs = object;
            else Object.assign(this.request.inputs, object);
        } else if(['string','number'].find(e=>e===typeof key) && typeof value==='object'){
            this.request.inputs[ key ] = value;
        } else if(typeof key==='object'){
            let object = {};
            for(let K in key){
                let V = key[ K ];
                if( (V instanceof Blob) || (V instanceof File) || (V instanceof FileList) || (V instanceof ArrayBuffer) )
                    this.file(K, V);
                else if(V instanceof HTMLInputElement)
                    this.input(K, V);
                else object[ K ] = V;
            }
            if(value===true) this.request.inputs = object;
            else Object.assign(this.request.inputs, object);
        }
        return this;
    }    
    /**
     * @description Use this method if you want to append files to the request.
     * @example
     * req.file( document.querySelector("[name=my-picture]") ) // Add File to request with "my-picture" key.
     * req.file( "picture", document.querySelector("[name=my-picture]").files ) // Add File[] to request with "my-picture" key.
     * 
     * req.file("README.md", new Blob([`## Title\n> Second line & subtitle`], {type:"text/markdown"}) )
     * 
     * req.request.files['README.md'].type
     * // output: "text/markdown"
     */
    public file(input: HTMLInputElement) : this;
    public file(key: string, input: HTMLInputElement) : this;
    public file(filename: string, blob: Blob | File | FileList | File[] | ArrayBuffer | ReadableStream<Uint8Array>) : this;
    public file(...props: any[]){
        let [ key, blob ] = props;
        let isFile = e=>(blob instanceof Blob || blob instanceof File || blob instanceof ReadableStream || blob instanceof ArrayBuffer);
        if(key instanceof HTMLInputElement){
            if(key.type!=='file') return this.input(key);
            let files = [];
            for(let i=0;i<key.files.length;i++) files.push( key.files.item(i) );
            this.request.files[ key.name ] = key.multiple ? files : files.shift();
        } else if(typeof key==="string"){
            if(blob instanceof HTMLInputElement){
                if(blob.type!=="file") return this.input(key, blob);
                let files = [];
                for(let i=0;i<blob.files.length;i++) files.push( blob.files.item(i) );
                this.request.files[ key ] = blob.multiple ? files : files.shift();
            }
            else if(blob instanceof Array) this.request.files[ key ] = blob.filter(isFile);
            else if(isFile( blob )) this.request.files[ key ] = blob;
        }
        return this;
    }
    /**
     * @description Add or Merge Request Properties
     * @example
     * req.merge("mode", "cors")
     * req.merge("redirect", "follow")
     * 
     * req.merge(new Headers)
     * req.merge("headers", new Headers)
     * 
     * req.merge(new FormData || new URLSearchParams)
     * req.merge("inputs", new FormData)
     * 
     * req.merge(new URL)
     * req.merge("url", new URL || "/endpoint" || "http://example.com/endpoint")
     */
    public merge<R extends {[K in keyof RequestInit]?: RequestInit[K]}>(request: R): this;
    public merge<K extends keyof RequestInit, V extends RequestInit[K]>(key: K, value: V): this;
    public merge(...props: any[]){
        let [ key, value, ...rest ] = props;
        let object : object = {};
        if(typeof key==='string') object[ key ] = value;
        else if(key instanceof URL) object['url'] = key, rest = [ value ].concat( rest );
        else if(key instanceof Headers) object['headers'] = key, rest = [ value ].concat( rest );
        else if(key instanceof FormData || key instanceof URLSearchParams) object['inputs'] = key, rest = [ value ].concat( rest );
        else if(key && typeof key==='object'){
            Object.assign( object, key );
            rest = [ value ].concat( rest );
        }
        for(let key in object){
            let value = object[ key ];
            switch(key){
                case "headers":
                    this.header(value, ...rest);
                    break;
                case "body":
                case "inputs":
                    this.input(value, ...rest);
                    break;
                default:
                    this.request[ key ] = value;
                    break;
            }
        }
        return this;
    }
    /**
     * @description The "on" method add EventListener for this Class Lifecycle
     * @description All listener return unlistener for remove function of queue.
     * @example
     * //If you are interested in intercepting the requests before they are sent you can use:
     * let unlisten = XHR.on("before", (req, opt) => {
     *     // This line modify req object & add "custom-header" with "custom-value"
     *     req.headers['custom-header] = "custom-value"
     * })
     * 
     * //If you are interested in intercepting the response you can use:
     * XHR.on("success", (response) => {
     *  return response.json();
     * })
     *  
     * //If you are interested in intercepting the errors you can use:
     * XHR.on("error", err=> new MyCustomError(err.message))
     * 
     */
    public on<E extends keyof Arcaela.XHRequest.EventListener, C extends Arcaela.XHRequest.EventListener[ E ]>(ev: E, callback: C) : ()=> void;
    public on(...props: any[]){
        let [ event, callback ] = props;
        (this.options.events[ event ] ||= []).push( callback );
        return ()=> this.options.events[ event ].splice( this.options.events[ event ].findIndex(e=>e===callback), 1);
    }
    /**
     * @description Use the "Driver" method statically to define a global "Driver" and not have to define it in each instance of the requests,
     * you just have to define it as "active" indicating the name and the second argument in TRUE.
     * @example 
     * XHR.driver("axios", (req, options)=>{
     *  // Create Axios instance
     *  let Instance = axios.create({});
     * 
     *  // Defining AbortController and Token with axios
     *  // You can use AborController if you want.
     *  let { cancel: abort, token } = CancelToken.source(); 
     * 
     *  // Creating Request
     *  Instance.get(req.url, {
     *      ...req,
     *      cancelToken: token,
     *  });
     * 
     *  //Adding Listeners
     *  Instance.interceptors.request.use( options.events.before, options.events.error );
     *  Instance.interceptors.response.use( options.events.success, options.events.error );
     * });
     * @description If you return a function, it will be assumed that the request cannot be canceled,
     * in case of returning an array, it will be considered to call the first argument when canceling the request.
     * @example
     * return [ abort, Instance ];
     * @param {string} name 
     * @param {EventListener['before']} executor 
     */
    public driver<N extends string, C extends Arcaela.XHRequest.EventListener['before']>(name: N, executor: C) : this;
    public driver<N extends string, C extends boolean>(name: N, active: C) : this;
    public driver(...props: any[]){
        let [ name, driver ] = props;
        if(typeof name!=='string') new Fatal("type/string");
        else if(typeof driver==='function') this.options.drivers[ name ] = driver;
        else if(typeof driver==='boolean'){
            if(!driver) new Fatal("You cannot disable a handler, in its case you can select another handler using its name and the TRUE argument.");
            else if(!(name in this.options.drivers))
                new Fatal("It seems that the driver is not stored, in this case you must define the driver using the \"driver\" method (static or public) to define the driver.");
            else this.options.driver = name;
        }
        return this;
    }
    /**
     * @description Use the "Driver" method statically to define a global "Driver" and not have to define it in each instance of the requests,
     * you just have to define it as "active" indicating the name and the second argument in TRUE.
     * @example 
     * XHR.driver("axios", (req, options)=>{
     *  // Create Axios instance
     *  let Instance = axios.create({});
     * 
     *  // Defining AbortController and Token with axios
     *  // You can use AborController if you want.
     *  let { cancel: abort, token } = CancelToken.source(); 
     * 
     *  // Creating Request
     *  Instance.get(req.url, {
     *      ...req,
     *      cancelToken: token,
     *  });
     * 
     *  //Adding Listeners
     *  Instance.interceptors.request.use( options.events.before, options.events.error );
     *  Instance.interceptors.response.use( options.events.success, options.events.error );
     * 
     * });
     * @description If you return a function, it will be assumed that the request cannot be canceled,
     * in case of returning an array, it will be considered to call the first argument when canceling the request.
     * @example
     * return [ abort, Instance ];
     * @param {string} name 
     * @param {Arcaela.XHRequest.EventListener['before']} executor 
     */
    static driver<N extends string, C extends Arcaela.XHRequest.EventListener['before']>(name: N, executor: C) : void;
    static driver(...props: any[]){
        let [ name, driver = true ] = props;
        if(typeof name!=='string') new Fatal("type/string");
        else if(typeof driver==='function') XHRequest.prototype.options.drivers[ name ] = driver;
        else if(typeof driver==='boolean'){
            if(!driver) new Fatal("You cannot disable a handler, in its case you can select another handler using its name and the TRUE argument.");
            else if(!(name in XHRequest.prototype.options.drivers))
                new Fatal("It seems that the driver is not stored, in this case you must define the driver using the \"driver\" method (static or public) to define the driver.");
            else XHRequest.prototype.options.driver = name;
        }
    }
    /**
     * @description [DEFAULT] A negative value indicates that the cache should not be used, even if the request is very recent.
     * @example
     * // Never use cache for this request.
     * xhr.cache(-1);
     * 
     * @description If a zero is specified as an argument, then the cache will be the priority, regardless of the lifetime.
     * @example
     * // If there is a cache, it is returned,
     * // otherwise the query is made, it is stored and then it will be read from the cache.
     * xhr.cache(0);
     * 
     * @description
     * The "cache" method is used to store the request / response in the browser's cache and return that cache if the response time is still valid.
     * @example
     * // Store response with 1 second time age.
     * xhr.cache(1);
     * 
     * @param {number|boolean} seconds - Time age of caches.
     * @param {boolean} update - Force response from server and store.
     * @returns {this}
     */
    public cache(seconds: number = -1) : this {
        this.options.cache = Number( seconds );
        return this;
    }
    /**
     * @description Use this method to call driver, but before call driver "BeforeEvents" are dispatched, and after success response
     * "SuccessEvents" will be dispatched or catch errors with "ErrorEvents".
     * @param {function} then - Interxeptor for response after {@link Arcaela.XHRequest.EventListener Success events}
     * @param {function} [handler] - Catch for errors after {@link Arcaela.XHRequest.EventListener Errors Events}
     * @returns {Promise}
     */
    public async then(then?: (res: Response)=>Promise<any>, handler?: (err: Error)=>Promise<any>){
        const driver = typeof this.options.driver==='function' ? this.options.driver : (
            this.options.drivers[ this.options.driver ]
        );
        for(let before of this.options.events.before)
            await before( this.request, this.options );
        return driver( this.request, this.options )
            .then(async response=>{
                for(let success of this.options.events.success)
                    response = await success( response );
                return typeof then==='function' ? then( response ) : response;
            })
            .catch(err=>{
                for(let error of this.options.events.error)
                    error( err );
                return typeof handler==='function' ? handler(err) : err;
            });
    }
}


XHRequest.driver("fetch", require("./fetch-driver") );
export default XHRequest;