import lodash from 'lodash';
import { Fatal, isObject, get, has, paths, merge, } from "@arcaelas/utils";
declare global {
    namespace Arcaela {
        type Object = Record<any, any>
        type Static = string | number | boolean | RegExp;
        namespace Eloquent {
            interface Query {
                Operators : {
                    gt: number
                    lt: number
                    gte: number
                    lte: number
                    regexp: RegExp
                    in: (string | number | boolean)[]
                    contains: string | number | boolean
                    notIn: (string | number | boolean)[]
                    notContains: string | number | boolean
                    eq: string | number | boolean | RegExp
                    not: string | number | boolean | RegExp
                }
                Builder: Query['A'] | Query['B']
                A:{ [K: string]: string | number | boolean | null | Query['A'] | Query['B'] }
                B: { [K: `$$${string}`]: { [K in keyof Query['Operators']]: Query['Operators'][K] } }

                Comparators: '<' | '>' | '<=' | '>=' | '==' | '!='
                OperatorsKeys: keyof Query['Comparators'] | keyof Query['Operators']
            }
            interface Iterators {
                Map(v?: Object, k?: number, items?: any[]) : any;
                Each(v?: Object, k?: number, items?: any[]) : void;
                Filter(v?: Object, k?: number, items?: any[]) : boolean;
                
                Find(k: string, v: Static): Object[];
                Find(query: Query['Builder']): Object[];
                Find(k: string, operator: Query['OperatorsKeys'], v: Static): Object[];
            }
        }
    }
}

export const operators : Arcaela.Object = {
    gt:(query: number, value: number): boolean => query > value,
    lt:(query: number, value: number): boolean => query < value,
    gte:(query: number, value: number): boolean => query >= value,
    lte:(query: number, value: number): boolean => query <= value,
    eq:(query: any, value: any): boolean => query === value,
    not:(query: any, value: any): boolean => query !== value,
    in:(query: any[], value: any): boolean => query.includes( value ),
    notIn(query: any[], value: any): boolean { return ! this.in(query, value); },
    contains:(query: any, value: any[]): boolean => value.includes( query ),
    notContains(query: any, value: any[]): boolean { return ! this.in(query, value); },
    regexp:(query: RegExp, value: any): boolean => query.test( String( value ) ),
};
export function QueryBuilder(query: Arcaela.Eloquent.Query['Builder'], arr: any[] = [], prepend: string = "") : string[][] {
    for(let key in query){
        let index = prepend.concat( key ),
            value = get(query, key, null);
        if(key.indexOf("$$")===0){
            for(let operator in value){
                arr.push([
                    prepend.concat( key.substring( 2 ) ),
                    operator,
                    value[ operator ]
                ]);
            }
        }
        else if(value instanceof RegExp)
            arr.push([ index, 'regexp', value ]);
        else if(value && typeof value==='object')
            QueryBuilder(value, arr, index.concat( '.' ) );
        else arr.push([ index, 'eq', value ]);
    }
    return arr.sort((a, b)=>a[0] > b[0] ? 1 : -1);
}
export function isMatch(query: Arcaela.Eloquent.Query['Builder'], item: Arcaela.Object): boolean {
    return QueryBuilder( query ).every((value: string[])=>
        operators[ value[1] ](value[2], get( item, value[0], null ))
    );
}

export class Collection<C extends Arcaela.Object[] | Collection = Arcaela.Object[]> {

    private items: C[] = [];
    private Collection = Collection;
    toString(){ return "[]"; }
    valueOf(){ return this.items; }
    get length(){ return this.items.length; }


    /**
     * @constructor
     */
    public constructor(items?: C);
    public constructor(items?: C) {
        this.items = items instanceof Array ? items : (
            items instanceof Collection ? items.all() : (
                typeof items === 'object' ? [items] : []
            )
        );
    }
    
    /**
     * Create a new instance of the collection but including the "macro" that have been indicated.
     */
    collect<T extends Arcaela.Object[] | Collection = []>(items?: T): Collection<T> {
        const c = new this.Collection( items );
        Object.setPrototypeOf(c, Object.getPrototypeOf( this ));
        return c;
    }

    /**
     * Add a custom callback to the collection to use it.
     * @example
     * collection.macro("some", function(cb){
     *  return this.items.some(cb);
     * });
     * 
     * collection.some(item=> item.id);
     */
    macro(key: string, value: Function): this {
        if(typeof key !== "string") new Fatal("type/string");
        if(typeof value !== "function") new Fatal("type/function");
        return Object.defineProperty(this, key, { value, enumerable: false, })
    }

    /**
     * Return all items into collection.
     */
    all(): C[] {
        return this.items;
    }

    /**
     * @description The chunk method breaks the collection into multiple, smaller collections of a given size
     */
    chunk(size: number): Collection;
    chunk(size: number): Collection {
        const chunks: Arcaela.Object[] = [];
        if (Array.isArray(this.items))
            for (let key = 0; key < this.items.length; key += size, size += size)
                chunks.push(this.items.slice(key, size));
        return this.collect( chunks );
    }

    /**
     * The concat method is used to merge two or more collections/arrays/objects:
     * You can also concat() an array of objects, or a multidimensional array
     */
    concat(...items: Arcaela.Object[]): Collection{
        return this.collect( this.items.concat(...items) );
    }

    /**
     * Count items length into collection.
     */
    count(): number {
        return Math.max(this.items.length, 0)
    }

    /**
     * Group Items By key and count.
     *
     * @example
     * countBy("key.optionalChained")
     * return {
     *  optionalChainedValue:1
     * }
     */
    countBy(executor: string | Arcaela.Eloquent.Iterators['Map']): Record<string, number> {
        if(!['function', 'string'].includes( typeof executor ))
            new Fatal("type/unknowm");
        return lodash.countBy(this.items, executor);
    }
    
    /**
    * @description Print collection and exit.
    */
    dd() : void {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
    }

    /**
    * @description Print collection and continue.
    */
    dump(): this;
    dump() {
        console.log(this);
        return this;
    }

    /**
     * @description The each method iterates over the items in the collection and passes each item to a callback,
     * If you would like to stop iterating through the items, you may return false from your callback.
     */
    each(fn: Arcaela.Eloquent.Iterators['Filter']): this {
        for (let index=0,stop=false;index<this.items.length&&!stop;index+=1)
            stop = fn(this.items[index], index)===false;
        return this;
    }

    /**
     * @description The every method may be used to verify that all elements of a collection pass a given truth test.
     */
    every(fn: Arcaela.Eloquent.Iterators['Filter']) {
        return this.items.every(fn);
    }

    /**
     * @description Filter the elements of the collection using Functions and Queries, some of the examples could be:
     * @description NOTE: It is important to use double "$" ($$) to refer to a property based query.
     * @example
     * collection.find(item=>{
     *  return item.age >= 18;
     * });
     * // or
     * collection.find({
     *  $$age:{ gte: 18 }
     * });
     * @example
     * collection.find({
     *  name: /Alejandro/,
     *  $$gender:{
     *      notIn:['animal','fruit'],
     *  },
     *  $$skills:{
     *      contains:"Liberty"
     *  },
     *  $$work:{
     *      notIn:["work", "without", "coffe"]
     *  }
     * });
     */
    find(iterator: Arcaela.Eloquent.Query['Builder'] | Arcaela.Eloquent.Iterators['Filter']) : Collection {
        if(typeof iterator==='function')
            return this.collect( this.items.filter( iterator ) );
        let builder = QueryBuilder( iterator );
        return this.collect(
            this.items.filter((item)=>builder.every(value=>operators[value[1]](value[2],get(item,value[0],null))))
        );
    }

    /**
     * @description It is a method similar to "find" but in this case it returns only one element.
     */
    findOne(iterator: Arcaela.Eloquent.Query['Builder'] | Arcaela.Eloquent.Iterators['Filter']) : Arcaela.Object {
        return this.find( iterator ).all()[ 0 ] || null;
    }

    /**
     * @description Removes the first element from an array and returns it.
     * @description If the array is empty, undefined is returned and the array is not modified.
     */
    first(){
        return this.items.shift();
    }

    /**
     * @description The "forget" method returns the items in the collection without the specified keys:
     * @example
     * let items = collection.forget("name", "email");
     * items[0].name // Expected: undefined
     */
    forget(...keys: string[] | string[][]): Collection {
        return this.collect(
            this.items.map(item=>lodash.omit(item,  ...keys))
        )
    }

    /**
     * @description The forPage method returns a new collection containing the items that would be present on a given page number.
     * The method accepts the page number as its first argument and the number of items to show per page as its second argument:
     * @example
     * let data = collection.paginate(1, 20);
     * {
     *  items: []
     *  prev: false
     *  next: 2
     * }
     */
    paginate(page: number = 1, count: number = 20) : { items:Arcaela.Object[], prev: number | false, next: number | false } {
        page = Math.max(page, 1);
        count = Math.max(count, 1);
        let items = this.items.slice((page*count) - count);
        return {
            items: items.slice(0, count),
            prev: page<=1 ? false : page-1,
            next: items.length > count ? page+1 : false,
        };
    }

    /**
     * @description The groupBy method groups the collection's items into multiple collections by a given key.
     * @example
     * collection.groupBy("age")
     * {  "18":[],  "19":[],  "21":[], ... }
     */
    groupBy(key: string) : Record<string, Arcaela.Object[]> {
        return lodash.groupBy(this.items, item => get(item, key, undefined));
    }

    /**
     * @description Alias for Array.indexOf
     */
    indexOf(predicate: (value: Arcaela.Object, index: number, obj: Arcaela.Object[]) => unknown, thisArg?: any): number {
        return this.items.findIndex( predicate );
    }

    /**
     * @description The join method joins the collection's values with a string.
     * @example
     * collection.join('name', ', ', ', and ');
     * // 'Alejandro, Arcaelas and Reyes'
     */
    join(key: string | Function): string;
    join(key: string, glue?: string): string;
    join(key: string, glue: string, union?: string): string;
    join(...props: any[]) : string {
        let items = this.items,
            [ key, glue = ",", union = ','] = props;
        if(typeof key==='function') items = items.map( key );
        else if(typeof key==='string') items = items.map(item=> get(item, key, '') );
        let word = items.slice(0, -1).join( glue );
        return word+(items.length>1?union+items.pop():'');
    }
    
    /**
     * @description The last method returns the last element in the collection that passes a given truth test:
     * @example
     * collection.last(function (item) {
     *     return item.timestamp > Date.now();
     * });
     */
    last(iterator?: Arcaela.Eloquent.Iterators['Filter']) : Arcaela.Object | undefined {
        return typeof iterator==='function' ?this.items.filter( iterator ).pop() :this.items.slice(-1)[0];
    }

    /**
     * @description The map method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items
     * @example
     * collection.map(item=> item.name.toUpperCase());
     * // ["Alejandro","Reyes","Arcaelas"]
     */
    map(fn: Arcaela.Eloquent.Iterators['Map']): Collection<any[]> {
        return this.collect(this.items.map((value, key) =>
            typeof fn === 'function' ? fn(value, key) : get(value, fn)
        ));
    }
    
    /**
     * @description The max method returns the maximum value of a given key
     */
    max(key: string): number {
        if (typeof key !== 'string') new Fatal("type/string");
        return Math.max(...this.items.map(item=> get(item, key, 0)));
    }

    /**
     * @description The min method returns the minimum value of a given key
     */
    min(key: string): number {
        if (typeof key !== 'string') new Fatal("type/string");
        return Math.min(...this.items.map(item=> get(item, key, 0)));
    }
    
    /**
     * @description Filter the elements of the collection using Functions and Queries, some of the examples could be:
     * @description NOTE: It is important to use double "$" ($$) to refer to a property based query.
     * @example
     * // all items with 17 or minor
     * collection.not(item=>{
     *  return item.age >= 18;
     * });
     * // or
     * collection.not("age", ">=", 18);
     * // or
     * collection.not({
     *  $$age:{ gte: 18 }
     * });
     * 
     * @example
     * 
     * collection.not({
     *  name: /Alejandro/,
     *  $$gender:{
     *      notIn:['animal','fruit'],
     *  },
     *  $$skills:{
     *      contains:"Liberty"
     *  },
     *  $$work:{
     *      notIn:["work", "without", "coffe"]
     *  }
     * });
     */
    not(iterator: Arcaela.Eloquent.Query['Builder'] | Arcaela.Eloquent.Iterators['Filter']) : Collection {
        if(typeof iterator==='function')
            return this.collect(this.items.filter((...a)=>!iterator(...a)));
        let builder = QueryBuilder(iterator);
        return this.collect(this.items.filter(item=>builder.filter(([ key, operator, value ])=>{
            return operators[ operator ](value,get(item, key ,null))
        }).length === 0));
    }

    /**
     * @description The only method returns the items in the collection with the specified keys:
     * @example
     * let items = collection.only("name", "email");
     * items[0].password // Expected: undefined
     */
    only(...keys: string[] | string[][]): Collection {
        return this.collect(
            this.items.map(item=>lodash.pick(item,  ...keys))
        )
    }
    
    /**
     * @description The pipe method passes the collection to the given callback and returns the result
     * @example
     * const collection = collect([1, 2, 3]);
     * const piped = collection.pipe(items => items.sum());
     * // 6
     */
    pipe(fn: (collect: this) => any): any {
        return fn(this);
    }

    /**
     * @description Removes the last element from an collection and returns it.
     * @description If the collection is empty, undefined is returned and the collection is not modified.
     */
    pop() {
        return this.items.pop();
    }

    /**
     * @description Inserts new elements at the start of an collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     */
    unshift(...items: Arcaela.Object[]): this {
        this.items.unshift(...items);
        return this;
    }

    /**
     * @description Appends new elements to the end of an collection, and returns the new length of the collection.
     * @param items New elements to add to the collection.
     */
    push(...items: Arcaela.Object[]) : this {
        this.items.push(...items);
        return this;
    }

    /**
     * @description Get random elements, with the argument "length" the number of elements is indicated.
     */
    random(length: number = Infinity) : Arcaela.Object {
        return this.items.sort(() => Math.floor(Math.random() * 0.5)).slice(0, length);
    }

    /**
     * @description Calls the specified callback function for all the elements in an collection. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the collection.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an collection value.
     */
    reduce<F extends ((current?: C, item?: Arcaela.Object, index?: number)=> any), C extends any>(callbackfn: F, initialValue: C) : any {
        return this.items.reduce( callbackfn, initialValue );
    }

    /**
     * @description Removes the first element from an collection and returns it.
     * @description If the collection is empty, undefined is returned and the collection is not modified.
     */
    shift() {
        return this.items.shift();
    }

    /**
     * @description Sort items random.
     */
    shuffle() {
        this.items = this.items.sort(() => Math.floor(Math.random() * 0.5))
        return this;
    }

    /**
     * Returns a copy of a section of an collection.
     * For both start and end, a negative index can be used to indicate an offset from the end of the collection.
     * For example, -2 refers to the second to last element of the collection.
     * @param start The beginning index of the specified portion of the collection.
     * If start is undefined, then the slice begins at index 0.
     * @param end The end index of the specified portion of the collection. This is exclusive of the element at the index 'end'.
     * If end is undefined, then the slice extends to the end of the collection.
     */
    slice(start: number, end: number = Infinity): Collection {
        return this.collect( this.items.slice(start, end) );
    }
    
    /**
     * @description Sort the elements of the collection (This method mutates the collection).
     */
    sort(key: string | ((a: Arcaela.Object, b: Arcaela.Object)=> number), dir: "asc" | "desc" = 'asc'): Collection {
        return this.collect(this.items.sort(typeof key==='function' ? key : (current, next)=>{
            next = get(next, key, undefined);
            current = get(current, key, undefined);
            return current===undefined?0:(next===undefined?(dir==="asc"?1:-1):(
                (current>next?1:-1)*(dir==='asc'?1:-1)
            ));
        }));
    }

    /**
     * Removes elements from an collection and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An collection containing the elements that were deleted.
     */
    splice(start: number, deleteCount: number, ...items: Arcaela.Object[]): Collection {
        return this.collect(this.items.splice( start, deleteCount, ...items))
    }

    /**
     * @description Sum the elements according to a specific key.
     * @example
     * collection.sum("price");
     * collection.sum(item=> item.price * 0.16);
     */
    sum(key: string) : number;
    sum(callback: (item: Arcaela.Object)=> number) : number;
    sum(iterator: any) : number {
        if(typeof iterator === 'function')
            return this.items.map( iterator )
                .reduce((c: number, i: any)=>Number(c + i), 0);
        return this.items.map((item)=>get(item, iterator, 0))
            .reduce((c: number, i: any)=>Number(c + i), 0);
    }

    /**
     * @description Retrieve items into collection as Array Plain.
     */
    toArray() : Arcaela.Object[] {
        return this.items;
    }

    /**
     * @description Filter the elements and leave only the elements that contain the indicated unique key.
     * @example
     * const collection = collect([
     *   { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
     *   { name: 'iPhone 5', brand: 'Apple', type: 'phone' },
     *   { name: 'Apple Watch', brand: 'Apple', type: 'watch' },
     *   { name: 'Galaxy S6', brand: 'Samsung', type: 'phone' },
     *   { name: 'Galaxy Gear', brand: 'Samsung', type: 'watch' },
     * ]);
     * const unique = collection.unique('brand');
     * const unique = collection.unique(item=> item.brand);
     * unique.all();
     * // [
     * //   { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
     * //   { name: 'Galaxy S6', brand: 'Samsung', type: 'phone' },
     * // ]
     */
    unique(iterator: string | Arcaela.Eloquent.Iterators['Map']): Collection {
        if (iterator === undefined)
            return this.collect( this.items.filter((element, index, self) => self.indexOf(element) === index) );
        return this.collect( lodash.uniqBy(this.items, iterator) );
    }

    /**
     * @description The when method will execute the given callback when the first argument given to the method evaluates to true:
     * @example
     * collection.when(user.role!=='admin', (users: Collection)=>{
     *  users.forget("password");
     * });
     */
    when(cond: boolean = false, iterator: (c: this, b: boolean)=> void, failure?: (c: this, b: boolean)=> void) : this {
        if(cond && typeof iterator === 'function')
            iterator(this, cond);
        else if(cond && typeof failure === 'function')
            failure(this, cond);
        return this;
    }

    /**
     * @description The where method filters the collection by a given key / value pair:
     * @example
     * collection.where('discounted', false);
     * @description When working with nested objects where() method allows dot notated keys.
     * @example
     * // The "where" method also allows for custom comparisons:
     * collection.where('product.category', 'office-supplies')
     * @description Non-identity / strict inequality (!==)
     * @example
     * collection.where('price', '!==', 100);
     * @description Less than operator (<)
     * @example
     * collection.where('price', '<', 100);
     * @description Less than or equal operator (<=)
     * @example
     * collection.where('price', '<=', 100);
     * @description Greater than operator (>)
     * @example
     * collection.where('price', '>', 100);
     * @description Greater or equal than operator (>)
     * @example
     * collection.where('price', '>=', 100);
     */
    where(key: string, value: Arcaela.Static): Collection;
    where(key: string, operator: Arcaela.Eloquent.Query['Comparators'], value: Arcaela.Static): Collection;
    where(...props: any[]): Collection {
        let [ key, operator, value ] = props;
        if(props.length<3) value = operator, operator = '==';
        operator = operator.replace("<", "lt") .replace("<=", "lte") .replace(">", "gt") .replace(">=", "gte") .replace("==", "eq") .replace("!=", "not");
        return this.find({ ['$$'+key]:{ [operator]: value } });
    }

}

export class Model<M extends Arcaela.Object | Model = {}> {
    private model: Arcaela.Object = {};
    private Model = Model;

    valueOf(){ return this.model; }
    toString(): string { return "{}"; }
    toJSON(): Arcaela.Object { return this.model; }
    get paths() : string[] { return paths(this.model); }
    /**
     * @description Return primary keys of the model.
     */
    keys() : string[] {
        return Object.keys(this.model);
    }
    values() :any[] {
        return Object.values(this.model);
    }

    constructor(model: M) {
        this.model = model instanceof Model ? model.toJSON() : (
            typeof model !=='object' ? new Fatal("type/object") : model
        );
    }

    /**
     * @description Create a new instance of the model.
     */
    static create(model: Arcaela.Object = {}) : Model {
        return new Model( model );
    }

    /**
     * @description Create a new instance of the model, but with the same functions added.
     */
    public create(model: Arcaela.Object = {}): Model {
        const c = new this.Model( model );
        Object.setPrototypeOf(c, Object.getPrototypeOf( this ));
        return c;
    }

    /**
     * Add a custom callback to the model to use it.
     * @example
     * model.macro("leave", function(key){
     *  return this[ key ];
     * });
     * 
     * model.leave("name")
     */
    macro(key: string, value: Function): this {
        if(typeof key !== "string") new Fatal("type/string");
        if(typeof value !== "function") new Fatal("type/function");
        return Object.defineProperty(this, key, { value, enumerable: false, })
    }
    
    dd() {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
    }

    /**
     * @description The diffAssoc method compares the collection against another collection or a plain object based on its keys and values.
     * @description This method will return the key / value pairs in the original collection that are not present in the given collection:
     * @example
     * const model = new Model({
     *   color: 'orange',
     *   type: 'fruit',
     *   remain: 6,
     * });
     * const diff = model.diff({
     *   color: 'yellow',
     *   type: 'fruit',
     *   remain: 3,
     *   used: 6,
     * });
     * diff.toJSON();
     * // { color: 'orange', remain: 6 };
     */
    diff(object: Arcaela.Object) {
        const noMatched = (object: Arcaela.Object, query: Arcaela.Object) => {
            const diff: Arcaela.Object = {};
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
        return this.create( noMatched(this.model, object) );
    }

    dump() {
        console.log(this);
        return this;
    }

    /**
     * @description We are going to iterate over each route of the model, recursively until reaching the value indicated in the "deph" attribute.
     * @description The iterations do not return any value, but they could modify the model.
     * @example
     * model.eachPath((path, value, self)=>{
     *  if(path==='messenger.online' && value===true)
     *      self.set("messenger.status", "¡I'm connected!")
     * });
     */
    eachPath(iterator: (path: string, value: any, self: Arcaela.Object)=> void, deph: number = Infinity): this{
        const chain = (object: Arcaela.Object, path?: string) => {
            for (let key in object) {
                let value = object[key];
                if (deph > 0 && value && typeof value === 'object') --deph, chain(value, key);
                else if (typeof iterator === 'function')
                    iterator((path ? path + '.' : '') + key, value, object);
            }
            return this;
        };
        return chain(this.model);
    }

    /**
     * @description The "except" method returns the items in the collection without the specified keys:
     * @example
     * let public = model.except("password");
     * public.password // Expected: undefined
     * @example
     * let public = model.except((value, key)=> key==='password');
     * public.password // Expected: undefined
     */
    except(...keys: string[]) : Model;
    except(iterator: (value?: any, key?: string)=> boolean) : Model;
    except(...props: any[]) : Model {
        let [ iterator, ...keys ] = props;
        return this.create( typeof iterator==='function' ? lodash.omitBy(this.model,  iterator) : lodash.omit(this.model, iterator, ...keys) )
    }

    /**
     * @description The get method returns the item at a given key or index.
     * @description If the key or index does not exist, null is returned:
     * @example
     * model.get("name") // "Alejandro Reyes"
     * @example
     * model.get("messenger.online") // true
     */
    get(key: string, defaultValue?: unknown) : any {
        return get(this.model, key, defaultValue);
    }

    /**
     * @description The has method determines if one or more keys exists in the collection:
     * @example
     * user.has("permissions.sleep"); // false
     */
    has(key: string) : boolean {
        return has(this.model, key);
    }

    /**
     * @description Determine if the model is empty.
     */
    isEmpty() : boolean {
        return Object.keys( this.model ).length===0;
    }

    /**
     * @description Determine if the model is not empty.
     */
    isNotEmpty() : boolean {
        return !this.isEmpty();
    }

    /**
     * @description Loop through the model to return a copy with the values ​​returned from the function.
     * @example
     * let model = new Model({
     *  name: "Alejandro",
     *  password: null,
     * });
     * 
     * model.map((value, key)=>{
     *  return value === null ? false : true;
     * });
     * 
     * model.toJSON(); // {name: true, password: false }
     */
    map(iterator: (value: any, key?: string, self?: this)=> any) : Model {
        return this.create(Object.entries( this.model ).reduce((c,[key, value])=>({
            ...c,
            [key]: iterator(value, key),
        }),{}));
    }

    /**
     * @description Verify that the current model matches a query/compare object.
     * @description You can also review about this function within the {@link Collection.find Collection.find()} class.
     * @example
     * model.match({ name: /Alejandro/ })
     * @example
     * model.match({
     *  messenger:{
     *      $$online:{
     *          not: false
     *      }
     *  }
     * })
     */
    match(query: Arcaela.Eloquent.Query['Builder']) : boolean {
        return QueryBuilder( query ).every((value: string[])=>
            operators[ value[1] ](value[2], get(this.model, value[0], null ))
        );
    }

    /**
     * @description Map the primary keys of the model, the result of the function must match an array of 1 or 2 elements.
     * @description The first would be its value and the second would be the replaceable key (if specified).
     * @example
     * const user = new Model({
     *  name: "Alejandro Reyes",
     *  age: "12"
     * });
     * 
     * user.mapWithKeys((value, key)=>{
     *  if(key==='age') return [ Number( value ) ]
     *  else if(key==='name') return [ value, 'firstName' ];
     * })
     * .toJSON()  // { firstName: "Alejandro Reyes", age: 12  }
     * 
     */
    mapWithKeys(iterator: <V extends any,K extends string>(value?: V, key?: K, self?: this)=> [ V, K ] ) : Model {
        let object : Arcaela.Object = {};
        for(let K in this.model){
            let [ value, key = K ] = iterator(this.model[ K ], K, this);
            object[ key ] = value;
        }
        return this.create(object);
    }

    /**
     * @description Merge new objects to the current model, only applicable for the first level of the model, if you need to deepen the merges, you should use {@link mergeDeph merge recursively}.
     */
    merge(...values: Arcaela.Object[]) : Model {
        return this.create( values.reduce((c,a)=>({...c,...a}), this.model) );
    }

    /**
     * @description Merge new objects to the current model, this method iterates over all the properties of the model, drilling down and replacing or adding.
     * @example
     * const user = new Model({
     *  payments:{
     *      billing:new Date(),
     *      status:{
     *          invoice: false,
     *      },
     *  }
     * });
     * // { billing: Date, status:{ invoice: false } }
     * 
     * const merged = user.mergeDeph({
     *  payments:{
     *      status:{
     *          credit: true,
     *      }
     *  }
     * })
     * // { billing: Date, status:{ invoice: false, credit: true } }
     * 
     */
    mergeDeph(...values: Arcaela.Object[]) : Model {
        return this.create( merge({}, this.model, ...values) );
    }

    /**
     * @description The pipe method passes the collection to the given callback and returns the result:
     * @example
     * const user = new Model({ name: "arcaela" })
     * const piped = user.pipe(model => model.paths);
     * // [ "name" ]
     */
    pipe(iterator: (self?: this)=> any ) : any {
        if("function"!== typeof iterator) new Fatal("type/function");
        return iterator(this);
    }

    /**
     * @description The pull method removes and returns an item from the model by its key:
     * @example
     * const user = new Model({
     *   firstname: 'Michael',
     *   lastname: 'Cera',
     * });
     * user.pull('lastname');
     * // Cera
     * user.toJSON();
     * // { firstname: 'Michael' }
     */
    pull(key: string, defaultValue: any = null) : any {
        if("string"!== typeof key) new Fatal("type/string");
        let value = get(this.model, key, defaultValue);
        lodash.unset(this.model, key);
        return value;
    }

    /**
     * @description Sets the value at path of object.
     * @description If a portion of path doesn't exist, it's created.
     * @description Arrays are created for missing index properties while objects are created for all other missing properties.
     * @example
     * var user = new Model({ 'a': [{ 'b': { 'c': 3 } }] });
     *  
     * user.set('a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     */
    set<V extends any>(key: string | number, value: V) : V {
        if(["string", 'number'].includes(typeof key)) new Fatal("type/string");
        lodash.set(this.model, key, value);
        return value;
    }

    /**
     * @description Removes the property at path of object.
     * @example
     * user.unset('a[0].b.c');
     * // => true
     */
    unset(key: string) : boolean {
        if("string"!== typeof key) new Fatal("type/string");
        return lodash.unset(this.model, key);
    }

    /**
     * @description The when method will execute the given callback when the first argument given to the method evaluates to true:
     * @example
     * // Update user if "now" is greater at "session_end".
     * user.when( Date.now() > session_end, (self)=>{
     *  self.set("online", false);
     * });
     */
    when(cond: boolean, then: (self?: this)=> void, callback?: (self?: this)=> void) {
        if ("function" !== typeof then) new Fatal("type/function");
        else if (cond && typeof then==='function') then(this);
        else if (typeof callback==='function') callback(this);
        return this;
    }

    whenEmpty(then: (self?: this)=> void, callback?: (self?: this)=> void) {
        return this.when( this.isEmpty(), then, callback);
    }

    whenNotEmpty(then: (self?: this)=> void, callback?: (self?: this)=> void) {
        return this.when( !this.isEmpty(), then, callback);
    }

};

export class Eloquent<I extends Arcaela.Object[] = []> extends Promise<I> {

    private Eloquent = Eloquent;

    /**
     * @constructor
     * @description Start an Eloquent instance under a list of procedures, the response is expected to be an array of objects.
     */
    constructor(executor: I | Promise<I> | (()=>I | Promise<I>)){
        super((done, failure)=>{
            try {
                if(typeof executor==='function')
                    done( executor() );
                else if(executor instanceof Promise)
                    executor.then( done ).catch( failure );
                else done( executor );
            } catch(err){ failure( err ); }
        });
    }

    /**
     * Create a new instance of the collection but including the "macro" that have been indicated.
     */
    collect<L extends Arcaela.Object[]>(items: L | Promise<L> | (()=>L | Promise<L>)) : Eloquent<L> {
        const c = new this.Eloquent( items );
        Object.setPrototypeOf(c, Object.getPrototypeOf( this ));
        return c;
    }

    /**
     * Add a custom callback to the collection to use it.
     * @example
     * collection.macro("some", function(cb){
     *  return this.items.some(cb);
     * });
     * 
     * collection.some(item=> item.id);
     */
    macro(key: string, value: Function): this {
        if(typeof key !== "string") new Fatal("type/string");
        if(typeof value !== "function") new Fatal("type/function");
        return Object.defineProperty(this, key, { value, enumerable: false, })
    }

    /**
     * Return all items into collection.
     */
    all(): PromiseLike<I> {
        return this.then(e=>e);
    }

}