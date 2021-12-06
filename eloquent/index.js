const lodash = require('lodash');
const { Fatal, isObject, get, empty, has, set, unset, paths, merge, } = require("@arcaelas/utils");

class Model {
    #model = {};
    toString(){ return "{}"; }
    valueOf(){ return this.model; }
    get model(){ return this.#model; }
    get paths() { return paths(this.model); }

    constructor(model = {}) {
        this.#model = model instanceof this.constructor ? model.toJSON() : (
            typeof model !=='object' ? new Fatal("type/object") : model
        );
    }

    create(model = {}) {
        const Class = class extends this.constructor {}
        Object.assign(Class.prototype, this);
        return new Class(model);
    }
    
    macro(key, fn) {
        if(typeof key !== "string") new Fatal("type/string");
        if(typeof fn !== "function") new Fatal("type/function");
        return Object.defineProperty(this, key, {
            value:fn,
            enumerable:false,
        })
    }
    
    toJSON() {
        return this.#model;
    }

    dd() {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
    }

    diff(object) {
        const noMatched = (object, query) => {
            const diff = {};
            for (let key in query) {
                if (!(key in object)) diff[key] = query[key];
                else if (isObject(object[key]) && isObject(query[key])) {
                    let df = noMatched(object[key], query[key]);
                    if (Object.keys(df).length) diff[key] = df;
                } else if (query[key] !== object[key])
                    diff[key] = query[key];
            }
            return diff;
        }
        return this.create( noMatched(this.#model, object) );
    }

    dump() {
        console.log(this);
        return this;
    }

    eachPath(callback, deph = Infinity) {
        const chain = (object, path) => {
            for (let key in object) {
                let value = object[key];
                if (deph > 0 && value && typeof value === 'object') chain(value, key, --deph);
                else if (typeof callback === 'function')
                    callback((path ? path + '.' : '') + key, value, object);
            }
            return this;
        };
        return chain(this.#model);
    }

    except(executor = []) {
        return this.create(collection = lodash[
            (executor.length === 1 && typeof executor[0] === 'function') ? 'omitBy' : 'omit'
        ](this.#model, executor));
    }

    get(key, defaultValue) {
        return get(this.#model, key, defaultValue);
    }

    has(key) {
        return has(this.#model, key);
    }

    isEmpty() {
        return Object.keys( this.#model ).length===0;
    }

    isNotEmpty() {
        return !this.isEmpty();
    }

    keys() {
        return Object.keys(this.#model);
    }

    map(executor) {
        return this.create(Object.entries(this.#model).reduce((object, [key, value]) => ({
            ...object,
            [key]: executor(value, key)
        }), {}));
    }

    match(query) {
        const isMatch = (object, query) => {
            for (let key in query) {
                if (!(key in object)) return false;
                else if (isObject(object[key]) && isObject(query[key])) {
                    if (!isMatch(object[key], query[key])) return false;
                } else if (query[key] instanceof RegExp) {
                    if (!query[key].test(object[key])) return false;
                } else if (query[key] !== object[key])
                    return false;
            }
            return true;
        }
        return isMatch(this.#model, query);
    }

    mapWithKeys(executor = (v, k) => [k, v]) {
        let collection = {};
        for (let [k, v] of Object.entries(this.#model)) {
            let res = executor(k, v, this);
            let [ key, value ] = res===undefined ? [k,v] : ( res instanceof Array ? res : [ k, res ] )
            collection[key] = value;
        }
        return this.create(collection);
    }

    merge(...values) {
        return this.create(merge({}, this.#model, ...values));
    }

    pipe(fn) {
        if("function"!== typeof fn) new Fatal("type/function");
        return fn(this);
    }

    pull(key, defaultValue = null) {
        if("string"!== typeof key) new Fatal("type/string");
        let value = get(this.#model, key, defaultValue);
        lodash.unset(this.#model, key);
        return value;
    }

    reduce(fn, carry) {
        if("function"!== typeof fn) new Fatal("type/function");
        return Object.entries(this.#model)
            .reduce((c, [key, value]) => fn(c, value, key), carry);
    }

    set(key, value) {
        if(["string", 'number'].includes( typeof key )) new Fatal("type/string");
        set(this.#model, key, value);
        return value;
    }

    unset(key) {
        if("string"!== typeof key) new Fatal("type/string");
        return unset(this.model, key);
    }

    values() {
        return Object.values(this.model);
    }

    when(cond, then, calback) {
        if ("function" !== typeof executor) new Fatal("type/function");
        else if ( cond && typeof then==='function') then(this);
        else if (typeof calback==='function') calback(this);
        return this;
    }

    whenEmpty(executor) {
        return this.when( this.isEmpty(), executor);
    }

    whenNotEmpty(executor) {
        return this.when(this.isNotEmpty(), executor);
    }

};

class Collection {

    items = []
    operators = {
        '<': (i,k,v)=>get(i,k)<v,
        '>': (i,k,v)=>get(i,k)>v,
        '>=': (i,k,v)=>get(i,k)>=v,
        '==': (i,k,v)=>get(i,k)==v,
        '!=': (i,k,v)=>get(i,k)!=v,
        '<=': (i,k,v)=>get(i,k)<=v,
        '<>': (i,k,v)=>get(i,k)!==v,
        '!==': (i,k,v)=>get(i,k)!==v,
        '===': (i,k,v)=>get(i,k)===v,
        'in': (i,k,v)=>v.includes(get(i,k)),
        'like': (i,k,v)=>(newRegExp(v)).test(get(i,k)),
        'between': (i,k,v)=>lodash.inRange(get(i,k),...v),
        'array-contains': (i,k,v)=>get(i,k,[]).includes(v),
    };

    toString(){ return "[]"; }
    valueOf(){ return this.items; }
    get length(){ return this.items.length; }

    addOperator(operator, callback){
        this.operators[ operator ] = callback;
        return this;
    }

    constructor(items = []) {
        this.items = items instanceof Array ? items : (
            items instanceof this.constructor ? items.all() : items
        );
    }

    collect(items = []) {
        const Class = class extends this.constructor {}
        Object.assign(Class.prototype, this.__proto__ || this.prototype);
        return new Class(items);
    }

    macro(key, fn) {
        if(typeof key !== "string") new Fatal("type/string");
        if(typeof fn !== "function") new Fatal("type/function");
        return Object.defineProperty(this.prototype || this.__proto__, key, {
            value:fn,
            enumerable:false,
        })
    }

    all() {
        return this.items;
    }

    chunk(size) {
        const chunks = [];
        if (Array.isArray(this.items))
            for (let key = 0; key < this.items.length; key += size, size += size)
                chunks.push(this.items.slice(key, size));
        return this.collect(chunks)
    }

    concat(...items) {
        return this.collect( this.items.concat(...items) );
    }

    count() {
        return Math.max(this.items.length, 0)
    }

    countBy(fn) {
        if(typeof fn !== "function") new Fatal("type/function");
        const group = this.groupBy(fn);
        for (let key in group)
            group[key] = group[key].length;
        return group;
    }

    dd() {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
    }

    dump() {
        console.log(this);
        return this;
    }

    each(fn) {
        let stop = false;
        for (let index = 0; index < this.items.length && !stop; index += 1)
            stop = fn(this.items[index], index, this.items) === false;
        return this;
    }

    every(fn) {
        return this.items.every(fn);
    }

    except(executor=[]) {
        return this.collect(
            this.items.map(item => lodash[
                typeof executor === 'function' ? 'omitBy' : 'omit'
            ](item, executor))
        );
    }

    filter(fn) {
        return this.collect(
            this.items.filter(typeof fn === 'function' ? fn : value => !empty(value))
        );
    }

    find(query, collect = true) {
        const isMatch = (object, query) => {
            for (let key in query) {
                if (!(key in object)) return false;
                else if (isObject(object[key]) && isObject(query[key])) {
                    if (!isMatch(object[key], query[key])) return false;
                } else if (query[key] instanceof RegExp) {
                    if (!query[key].test(object[key])) return false;
                } else if (query[key] !== object[key])
                    return false;
            }
            return true;
        }
        let items = this.items.filter(item => isMatch(item, query));
        return collect ? this.collect(items) : items;
    }

    findOne(query) {
        return this.find(query, false).shift();
    }

    forPage(pageNumber = 1, itemsCount = 50) {
        pageNumber = Math.max(pageNumber, 1);
        itemsCount = Math.max(itemsCount, 1);
        return this.collect( this.items.slice((pageNumber * itemsCount) - itemsCount, itemsCount) );
    }

    groupBy(key) {
        return lodash.groupBy(this.items, item => get(item, key, undefined));
    }

    indexOf(valueOrFunction) {
        return this.items.findIndex( valueOrFunction );
    }

    isEmpty() {
        return !this.items.length;
    }

    isNotEmpty() {
        return !!this.items.length;
    }

    join(key, ...rest) {
        let items = this.items;
        if(typeof key==='function') items = items.map( key );
        if(typeof key==='string') items = items.map(item=> get(item, key, '') );
        const [ glue, finalGlue ] = rest.concat([...rest, ...rest, ',']);
        const last = items.pop();
        return items.length ? (
            [items.join(glue), last].join(finalGlue)
        ) : last;
    }

    keys() {
        return this.collect(Object.keys(this.items));
    }

    map(fn) {
        return this.collect(this.items.map((value, key) =>
            typeof fn === 'function' ? fn(value, key) : get(value, fn)
        ));
    }

    max(key) {
        if (typeof key === 'string')
            return Math.max(...this.items.map(item => get(item, key, 0)));
        return Math.max(...this.items);
    }

    min(key) {
        if (typeof key === 'string')
            return Math.min(...this.items.map(item => get(item, key, 0)));
        return Math.min(...this.items);
    }

    not(query, collect = true) {
        const isMatch = (object, query) => {
            for (let key in query) {
                if (!(key in object)) return false;
                else if (isObject(object[key]) && isObject(query[key])) {
                    if (!isMatch(object[key], query[key])) return false;
                } else if (query[key] instanceof RegExp) {
                    if (!query[key].test(object[key])) return false;
                } else if (query[key] !== object[key])
                    return false;
            }
            return true;
        }
        let items = this.items.filter(item => !isMatch(item, query));
        return collect ? this.collect(items) : items;
    }

    only(executor = []) {
        return this.collect(this.items.map(item => lodash[
            (executor.length === 1 && typeof executor[0] === 'function') ? 'pickBy' : 'pick'
        ](item, ...executor)));
    }

    pad(times = 0, fill = null, dir = 'both') {
        times = Math.max(1, times);
        const array = new Array(times).fill(fill);
        return this.collect(dir === "both" ? array.splice(0, Math.ceil(times / 2)).concat(this.items, array) : (
            dir === 'left' ? array.concat(this.items) : this.items.concat(array)
        ));
    }

    partition(executor) {
        let arrays = [ [], [] ];
        for (let key = 0, { length } = this.items;key<length;key++) {
            let value = this.items[key];
            arrays[executor(value, key) ? 1 : 0].push( value );
        }
        return this.collect(arrays);
    }

    pipe(fn) {
        return fn(this);
    }

    pop() {
        return this.items.pop();
    }

    unshift(...items) {
        this.items.unshift(...items);
        return this;
    }

    push(...items) {
        this.items.push(...items);
        return this;
    }

    random(length = Infinity) {
        return this.items.sort(() => Math.floor(Math.random() * 0.5)).slice(0, length);
    }

    reduce(fn, carry) {
        let value = this.items.reduce(fn, carry);
        return value instanceof Array ? this.collect(value) : value;
    }

    reject(fn) {
        return this.collect(this.items.filter(item => !fn(item)));
    }

    shift() {
        return this.items.shift();
    }

    shuffle() {
        this.items = this.items.sort(() => Math.floor(Math.random() * 0.5))
        return this;
    }

    slice(start, count = Infinity) {
        return this.collect( this.items.slice(start, count) );
    }

    sort(key, dir = 'asc') {
        return this.collect(this.items.sort(typeof key === 'function' ? key : (current, next) => {
            return (key in current) ? (
                (key in next) ? (
                    (current[key] > next[key] ? 1 : -1) * (dir === 'asc' ? 1 : -1)
                ) : (dir === 'asc' ? 1 : -1)
            ) : 0;
        }));
    }

    splice(start = -1, deleteCount = Infinity) {
        return this.collect(this.items.splice(start, deleteCount));
    }

    sum(key) {
        let array = this.items;
        if(typeof key==='function') array = array.map(key);
        else if(typeof key==='string') array = array.map(item=>get(item,key));
        return array.reduce((c,n)=>c + n, 0);
    }

    times(n, fn) {
        new Array(n).forEach((c,i)=> this.items.push( fn(i, c) ));
        return this;
    }

    unique(keyOrFunction) {
        let collection;
        if (keyOrFunction === undefined)
            collection = this.items
            .filter((element, index, self) => self.indexOf(element) === index);
        else {
            collection = [];
            const usedKeys = [];
            for (let iterator = 0, { length } = this.items; iterator < length; iterator += 1) {
                let uniqueKey = (typeof keyOrFunction==='function') ? keyOrFunction(this.items[iterator]) : this.items[iterator][keyOrFunction];
                if (usedKeys.indexOf(uniqueKey) < 0) {
                    collection.push(this.items[iterator]);
                    usedKeys.push(uniqueKey);
                }
            }
        }
        return this.collect(collection);
    }

    when(cond = null, executor, failure) {
        if ("function" !== typeof executor) new Fatal("type/function");
        if (cond) executor(this, cond);
        else if ("function" === typeof failure) failure(this, cond);
        return this;
    }

    whenEmpty(executor) {
        return this.when(!this.items.length, executor);
    }

    whenNotEmpty(executor) {
        return this.when(this.items.length, executor);
    }

    where(key, operator, value) {
        if(typeof key==='function') return this.filter( key );
        else if(key && typeof key==='object') return this.find( key );
        else if(typeof key!=='string') new Fatal("type/string");
        if ([undefined, true].includes(operator))
            return this.collect( this.items.filter(item => get(item, key)) );
        else if (operator === false)
            return this.collect( this.items.filter(item => !get(item, key)) );
        if (value === undefined)
            value = operator, operator = '===';
        let filter = operator in this.operators ? this.operators[ operator ] : null;
        if(!filter) new Fatal("empty", "The specified operator is not allowed or has not been included.");
        return this.collect(this.items.filter(filter));
    }
};

class Eloquent extends Promise {

    operators = {
        '<': (i,k,v)=>get(i,k)<v,
        '>': (i,k,v)=>get(i,k)>v,
        '>=': (i,k,v)=>get(i,k)>=v,
        '==': (i,k,v)=>get(i,k)==v,
        '!=': (i,k,v)=>get(i,k)!=v,
        '<=': (i,k,v)=>get(i,k)<=v,
        '<>': (i,k,v)=>get(i,k)!==v,
        '!==': (i,k,v)=>get(i,k)!==v,
        '===': (i,k,v)=>get(i,k)===v,
        'in': (i,k,v)=>v.includes(get(i,k)),
        'like': (i,k,v)=>(newRegExp(v)).test(get(i,k)),
        'between': (i,k,v)=>lodash.inRange(get(i,k),...v),
        'array-contains': (i,k,v)=>get(i,k,[]).includes(v),
    };

    constructor(collect = []){
        super(typeof collect==='function' ? collect : r=>(
            (collect instanceof Array || collect instanceof Eloquent) ? r( collect ) : r([ collect ])
        ));
    }

    addOperator(operator, callback){
        this.operators[ operator ] = callback;
        return this;
    }

    collect(items = []) {
        const Class = class extends this.constructor {}
        Object.assign(Class.prototype, this);
        return new Class(r=>r(items));
    }

    macro(key, fn) {
        if(typeof key !== "string") new Fatal("type/string");
        if(typeof fn !== "function") new Fatal("type/function");
        return Object.defineProperty(this, key, {
            value:fn,
            enumerable:false,
        })
    }

    all() {
        return this.then(items=> items);
    }

    chunk(size) {
        return this.then(items=>{
            const chunks = [];
            if (items instanceof Array)
                for (let key = 0; key < items.length; key += size, size += size)
                    chunks.push(items.slice(key, size));
            return this.collect(chunks)
        });
    }

    concat(..._items) {
        return this.then(items=>this.collect(items.concat(..._items)));
    }

    count() {
        return this.then(items=> items.length);
    }

    countBy(fn) {
        if(typeof fn !== "function") new Fatal("type/function");
        return this.groupBy(fn).then(group=>{
            for (let key in group)
                group[key] = group[key].length;
            return group;
        });
    }

    dd() {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
    }

    dump() {
        console.log(this);
        return this;
    }

    each(fn) {
        return this.then(items=>{
            let stop = false;
            for (let index = 0; index < items.length && !stop; index += 1)
                stop = fn(items[index], index, items) === false;
            return this;
        });
    }

    every(fn) {
        return this.then(items=> items.every( fn ));
    }

    except(executor = []) {
        return this.then(items=> this.collect(items.map(item => lodash[
            typeof executor === 'function' ? 'omitBy' : 'omit'
        ](item, executor))));
    }

    filter(fn) {
        return this.then(items=>this.collect(
            items.filter(typeof fn === 'function' ? fn : value => !empty(value))
        ));
    }

    find(query, collect = true) {
        const isMatch = (object, query) => {
            for (let key in query) {
                if (!(key in object)) return false;
                else if (isObject(object[key]) && isObject(query[key])) {
                    if (!isMatch(object[key], query[key])) return false;
                } else if (query[key] instanceof RegExp) {
                    if (!query[key].test(object[key])) return false;
                } else if (query[key] !== object[key])
                    return false;
            }
            return true;
        }
        return this.then(items=>{
            items = items.filter(item => isMatch(item, query));
            return collect ? this.collect(items) : items;
        });
    }

    findOne(query) {
        return this.then(()=>this.find(query, false).shift());
    }

    forPage(pageNumber = 1, itemsCount = 50) {
        return this.then(items=>{
            pageNumber = Math.max(pageNumber, 1);
            itemsCount = Math.max(itemsCount, 1);
            return this.collect( items.slice((pageNumber * itemsCount) - itemsCount, itemsCount) );
        });
    }

    groupBy(key) {
        return this.then(items=>
            lodash.groupBy(items, item => get(item, key, undefined))
        );
    }

    indexOf(valueOrFunction) {
        return this.then(items=>
            items.findIndex( valueOrFunction )
        );
    }

    isEmpty() {
        return this.then(items=> !items.length );
    }
    
    isNotEmpty() {
        return this.then(items=> items.length>0 );
    }

    join(key, ...rest) {
        return this.then(items=>{
            if(typeof key==='function') items = items.map( key );
            if(typeof key==='string') items = items.map(item=> get(item, key, '') );
            const [ glue, finalGlue ] = rest.concat([...rest, ...rest, ',']);
            const last = items.pop();
            return items.length ? (
                [items.join(glue), last].join(finalGlue)
            ) : last;
        });
    }

    map(fn) {
        return this.then(items=>this.collect(items.map((value, key) =>
            typeof fn === 'function' ? fn(value, key) : get(value, fn)
        )));
    }

    max(key) {
        return this.then(items=>{
            if (typeof key === 'string')
                return Math.max(...items.map(item => get(item, key, 0)));
            return Math.max(...items);
        });
    }

    min(key) {
        return this.then(items=>{
            if (typeof key === 'string')
                return Math.min(...items.map(item => get(item, key, 0)));
            return Math.min(...items);
        });
    }

    not(query, collect = true) {
        const isMatch = (object, query) => {
            for (let key in query) {
                if (!(key in object)) return false;
                else if (isObject(object[key]) && isObject(query[key])) {
                    if (!isMatch(object[key], query[key])) return false;
                } else if (query[key] instanceof RegExp) {
                    if (!query[key].test(object[key])) return false;
                } else if (query[key] !== object[key])
                    return false;
            }
            return true;
        }
        return this.then(items=>{
            items = items.filter(item => !isMatch(item, query));
            return collect ? this.collect(items) : items;
        });
    }

    only(executor = []) {
        return this.then(items=> this.collect(items.map(item => lodash[
            (executor.length === 1 && typeof executor[0] === 'function') ? 'pickBy' : 'pick'
        ](item, ...executor))));
    }

    pad(times = 0, fill = null, dir = 'both') {
        return this.then(items=>{
            times = Math.max(1, times);
            const array = new Array(times).fill(fill);
            return this.collect(dir === "both" ? array.splice(0, Math.ceil(times / 2)).concat(items, array) : (
                dir === 'left' ? array.concat(items) : items.concat(array)
            ));
        });
    }

    partition(executor) {
        return this.then(items=>{
            let arrays = [ [], [] ];
            for (let key = 0, { length } = this.items;key<length;key++) {
                let value = this.items[key];
                arrays[executor(value, key) ? 1 : 0].push( value );
            }
            return arrays;
        });
    }

    pipe(fn) {
        return fn(this);
    }

    pop() {
        return this.then(items=> items.pop() );
    }

    unshift(..._items) {
        return this.then(items=>{
            items.unshift(..._items);
            return this;
        });
    }

    push(..._items) {
        return this.then(items=>{
            items.push(..._items);
            return this;
        });
    }

    random(length = Infinity) {
        return this.then(items=>
            items.sort(() => Math.floor(Math.random() * 0.5)).slice(0, length)
        );
    }

    reduce(fn, carry) {
        return this.then(items=>{
            let value = items.reduce(fn, carry);
            return value instanceof Array ? this.collect(value) : value;
        });
    }

    reject(fn) {
        return this.then(items=>
            this.collect(items.filter(item => !fn(item)))
        );
    }

    shift() {
        return this.then(items=> items.shift() );
    }

    slice(start, count = Infinity) {
        return this.then(items=>
            this.collect( items.slice(start, count) )
        );
    }

    sort(key, dir = 'asc') {
        return this.then(items=>this.collect(items.sort(typeof key === 'function' ? key : (current, next) => {
            return (key in current) ? (
                (key in next) ? (
                    (current[key] > next[key] ? 1 : -1) * (dir === 'asc' ? 1 : -1)
                ) : (dir === 'asc' ? 1 : -1)
            ) : 0;
        })));
    }

    splice(start = -1, deleteCount = Infinity) {
        return this.then(items=>
            this.collect(items.splice(start, deleteCount))
        );
    }

    sum(key) {
        return this.then(array=>{
            if(typeof key==='function') array = array.map(key);
            else if(typeof key==='string') array = array.map(item=>get(item,key));
            return array.reduce((c,n)=>c + n, 0);
        });
    }

    times(n, fn) {
        return this.then(items=>{
            new Array(n).forEach((c,i)=> items.push( fn(i, c) ));
            return this;
        });
    }

    unique(keyOrFunction) {
        return this.then(items=>{
            let collection;
            if (keyOrFunction === undefined)
                collection = items
                .filter((element, index, self) => self.indexOf(element) === index);
            else {
                collection = [];
                const usedKeys = [];
                for (let iterator = 0; iterator < items.length; iterator += 1) {
                    let uniqueKey = (typeof keyOrFunction==='function') ? keyOrFunction(items[iterator]) : items[iterator][keyOrFunction];
                    if (usedKeys.indexOf(uniqueKey) < 0) {
                        collection.push(items[iterator]);
                        usedKeys.push(uniqueKey);
                    }
                }
            }
            return this.collect(collection);
        });
    }

    when(cond = null, executor, failure) {
        return this.then(()=>{
            if ("function" !== typeof executor) new Fatal("type/function");
            if (cond) executor(this, cond);
            else if ("function" === typeof failure) failure(this, cond);
            return this;
        });
    }

    whenEmpty(executor) {
        return this.when(!this.items.length, executor);
    }

    whenNotEmpty(executor) {
        return this.when(this.items.length, executor);
    }

    where(key, operator, value) {
        return this.then(items=>{
            if(typeof key==='function') return this.filter( key );
            else if(key && typeof key==='object') return this.find( key );
            else if(typeof key!=='string') new Fatal("type/string");
            if ([undefined, true].includes(operator))
                return this.collect( items.filter(item => get(item, key)) );
            else if (operator === false)
                return this.collect( items.filter(item => !get(item, key)) );
            if (value === undefined)
                value = operator, operator = '===';
            let filter = operator in this.operators ? this.operators[ operator ] : null;
            if(!filter) new Fatal("empty", "The specified operator is not allowed or has not been included.");
            return this.collect(items.filter(filter));
        });
    }
};

exports.Model = Model;
exports.Eloquent = Eloquent;
exports.Collection = Collection;