export = async function fetchDriver<R extends Arcaela.XHRequest.RequestInit, O extends Arcaela.XHRequest.Options>(request: R, options: O) : Promise<any> {
    /* We call the functions before packaging the request. */
    for(let before of options.events.before)
        before(request, options);
    const req: any = {};
    /* HEADERS */
    req.headers = req.headers instanceof Headers ? req.headers : Object.entries(req.headers).reduce((h, [k, v])=>{
        h.set(k, String( v ));
        return h;
    }, new Headers());

    /* BODY */
    req.body = req.headers.get("content-type")?.match(/multipart\/form\-data/i) ? new FormData() : (
        req.headers.get("content-type")?.match(/application\/x-www-form-urlencoded/i) ? new URLSearchParams() : null
    );

    /* FILES */
    for(let filename in req.files){
        req.body ||= new FormData();
        if(req.body instanceof FormData){
            let files = req.files[ filename ];
            if(files instanceof Array)
                for(let file of files)
                    req.body.append(filename, file);
            else req.body.set( filename, files);
        } else break;
    }

    /* INPUTS */
    for(let name in req.inputs){
        let value = req.inputs[ name ];
        if(req.body instanceof URLSearchParams || req.body instanceof FormData){
            if(value instanceof Array) {
                for(let item of value)
                    req.body.append(name, String(item));
            } else req.body.set(name, String(value));
        } else req.body[ name ] = value;
    }

    /* CONTROLLERS */
    let { abort, signal } = new AbortController();
    req.signal = signal;
    let store = (typeof caches==='object') ? await window.caches.open("XHRequest") : {
        match: async (req: Request) : Promise<Response> => null,
        put: async (req: Request, res: Response) : Promise<void> => null,
    }

    /* FETCH PROMISE */
    class Fetch<T extends Response> extends Promise<T> {
        abort(){ return abort(); }
    }
    

    let _request = new Request(req.url, req);
    return new Fetch(async (resolve, reject)=> {
        try{
            let response : Response = options.cache>=0 ? await store.match( _request ).then(response=>{
                let age = new Date(response.headers.get("date") || 0);
                if(response && options.cache===0 || ((Date.now()-age.getTime())/1000)<=options.cache)
                    return response;
                return;
            }) : null;
            resolve( response || fetch( _request.clone() ) );
        } catch(e){ reject(e); }
    })
    .then(async response=>store.put(_request,response.clone()).then(e=>{
        /* We call the functions after error the request. */
        for(let success of options.events.success)
            success(response);
        return response;
    }))
    .catch(err=>{
        /* We call the functions after error the request. */
        for(let error of options.events.error)
            error(err);
        throw err;
    });
};