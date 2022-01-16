/**
 * 
 * @param {*} fn 
 * @returns {boolean}
 */
export function isObject(fn) {
    return fn && typeof fn === 'object' && !(fn instanceof Array);
}

/**
 * 
 * @param {*} fn 
 * @returns {boolean}
 */
export function isFunction(fn) {
    return typeof fn === 'function';
}

/**
 * @description Create a Promify for unexpected values or functions.
 * @example
 * async function readFile(){
 *  const promise = promify();
 *  fs.readFile(a,b,(err)=>{
 *      if(err) promise.reject(err);
 *      else promise.resolve("¡Good Luck!");
 *  });
 *  return promise;
 * }
 * @returns {Promise<> & { resolve(), reject() }}
 */
 export function promify(){
    let status : { [k: string]: (v: unknown)=> void } = {
        reject(v: unknown){},
        resolve(v: unknown){},
    };
    const promise : Promise<unknown> & {
        reject?: any
        resolve?: any
    } = new Promise((resolve, reject)=>status = {resolve, reject});
    promise.reject = status.reject;
    promise.resolve = status.resolve;
    return promise;
};

/**
 * 
 * @param {object} object 
 * @param {string} key 
 * @returns {boolean}
 */
export function has(object, path) {
    try {
        return path.split(".").reduce((exists, key)=>key in exists && exists[ key ], object);
    } catch (err) {
        return false;
    }
}

/**
 * 
 * @param {object} object 
 * @param {string} key 
 * @returns {*}
 */
export function get(object, path = '', defaultValue) {
    try {
        return path.split('.').reduce((obj, key) => {
            return obj[key];
        }, object);
    } catch (err) { return defaultValue; }
}

/**
 * 
 * @param {object} object 
 * @param {string} path 
 * @param {*} value 
 * @returns {@var value}
 */
export function set(object, path='', value){
    let target = object;
    let keys = path.split(".");
    while(keys.length){
        let key = keys.shift();
        target = target[ key ] = !keys.length ? value :(key in target
            ?(target[key]&&typeof target[key]==='object'?target[key]:(keys.length?{}:value)):{}
        );
    }
    return object;
}

/**
 * 
 * @param {object} target 
 * @param  {object[]} items
 * @returns {object}
 */
export function merge(target, ...items){
    target = isObject( target ) ? target : {};
    for(let item of items){
        if(typeof item!=='object') continue;
        for(let key in item){
            let value = item[ key ];
            if(!(target[key] instanceof Array) && target[key] instanceof Object && value instanceof Object)
                target[key] = merge(target[key], value);
            else target[ key ] = value;
        }
    }
    return target;
}

/**
 * 
 * @param {object} object 
 * @param {string} path 
 * @returns 
 */
export function unset(object, path=''){
    let target,
        keys = path.split('.'),
        key = keys.shift();
    if( keys.length === 0) delete object[ key ];
    else if( key in object ) {
        target = object[ key ];
        while(keys.length){
            key = keys.shift();
            if( target && typeof target==='object' && key in target ){
                if( !keys.length){
                    delete target[ key ];
                    break;
                } else target = target[ key ];
            }
            else break;
        }
    }
    return object;
};


/**
 * @example
 * paths({ user:"arcaelas", "age": 25, job:{ home:"dream", school:"student", } })
 * // ['user','age','job.home', 'job.school']
 * @param {{}} object 
 * @returns {string[]}
 */
export function paths(object){
    const c = (model, prefix = '', arr=[])=>{
        for(let key in model){
            let value = model[ key ];
                key = prefix?prefix+'.'+key:key;
            if(value && typeof value==='object')
                c(value, key, arr);
            else arr.push( key );
        }
        return arr;
    };
    return c(object);
};

/**
 * @description Return true if value is not empty.
 * @param {*} value 
 * @returns {boolean}
 */
export function empty(value) {
    return [undefined, null, false, 0].some(e=> e===value) ||
        (['object', 'string'].some(e=> e===typeof value) && !Object.keys(value).length) ||
        (Array.isArray(value) && !value.length);
};

/**
 * @description Get random number.
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function rand(min = -Infinity, max = Infinity){
    return Math.floor((Math.random() * (max - min + 1) + min));
};

/**
 * @param {number} time 
 * @param {any} [response] 
 * @returns {Promise<response>}
 */
export function sleep(time=100, response){
    return new Promise((r)=>setTimeout(()=>r(response), Number(time)));
};

export function event() : {
    on(ev: string, handler: Function): Function,
    off(ev: string, handler: Function): void,
    trigger(ev: string, ...arg: any[]): void,
    [k: string]: any
}{
    return {
        __events: {},
        on(ev: string, handler: Function) : Function {
            this.__events[ ev ] ||= [];
            this.__events[ ev ].push( handler );
            return ()=>this.off(ev, handler);
        },
        off(ev: string, handler: Function) : void {
            if( this.__events[ ev ] ){
                let index = this.__events[ ev ].findIndex((v)=>v===handler);
                if( index > -1)
                this.__events[ ev ].splice(index, 1);
            }
        },
        trigger(ev: string, ...arg: any[]) : void {
            if(this.__events[ ev ]){
                for(let c of this.__events[ ev ])
                    c(...arg);
            }
        },
    };
};

const cookie = {
    toSeconds: function (time = 3, e = 0) {
        time = empty(time) ? 0 : time;
        let now = new Date().getTime();
        time = !isNaN(Number(time)) ? (new Date().getTime() + time) : (
            typeof time === 'string' ? new Date(time).getTime() : new Date("2035").getTime()
        );
        return e = (time - now), e > 0 ? e : 0;
    },
    set: function (name: string, value: string, time: number|string = Infinity, path?: string, domain?: string, https: boolean = false) : void | string {
        return document.cookie =
            encodeURIComponent(name) +
            "=" + encodeURIComponent(value) +
            ("; max-age=" + this.toSeconds(time)) +
            (path ? "; path=" + path : "") +
            (domain ? "; domain=" + domain : "") +
            (https ? "; secure" : ""), value;
    },
    get: function (name) {
        return this.all[name] || undefined;
    },
    remove: function (name, ...server) : boolean {
        return this.set(name, undefined, false, ...server), !this.all[name];
    },
    has: function (key) {
        return Object.keys(this.all).some(e=> e===key);
    },
    get all() {
        var cookies = [];
        return document.cookie.split(';').forEach(cookie => {
            cookies[decodeURIComponent(cookie.substr(0, cookie.indexOf('='))).trim()] =
                decodeURIComponent(cookie.substr(cookie.indexOf('=') + 1));
        }), cookies;
    }
};


export function setcookie(name, ...props: [string, number, ...any]) : string {
    return props.length ? cookie.set(name, ...props) : cookie.get( name );
};

/**
 * 
 * @param {string} name 
 * @returns {null}
 */
export function unsetcookie(name) : boolean {
    return cookie.remove(name);
};


/*****************  Development  *******************/

/**
 * @deprecated No long maintener
 * @param {{}|[]} object 
 * @returns {{}|[]}
 */
export function clone(object) {
    return JSON.parse(JSON.stringify(object));
}


/**
 * 
 * @param {number} phone 
 * @param {string} text 
 * @returns {string}
 */
export function WhatsApp(phone, text){
    return (([
        `https://wa.me/${phone}?phone=${phone}&text=${encodeURI( text )}`,
        `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURI( text )}`
    ][window.innerWidth <= 500 ? 0 : 1]));
};

/**
 * 
 * @param {*} arr 
 * @returns {boolean}
 */
export function blank(arr) {
    return (null ||
        arr === null ||
        arr === undefined ||
        (Array.isArray(arr) && !arr.length) ||
        (typeof arr === 'string' && arr.trim().length == 0) ||
        (arr && typeof arr === 'object' && !Object.keys(arr).length)
    );
};

/**
 * 
 * @param {string} key 
 * @param  {...any} next
 * @returns {*}
 */
export function cache(key, ...next){
    let BD = window.localStorage;
    if (!next.length) {
        let data = JSON.parse(BD.getItem(key) || '{"expire":0}');
        return (new Date()).getTime() < data.expire ? data.data : undefined;
    } else if (next.length >= 1) {
        return BD.setItem(key, JSON.stringify({
            key,
            data: next[0],
            expire: ((new Date).getTime() + ((typeof parseInt(next[1]) === 'number' ? next[1] : 180) * 1000)),
        })), next[0];
    }
};