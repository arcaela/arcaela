declare global {
    namespace Arcaela {
        type MapIterator = (v: any, k: string)=> any
        type FilterIterator = (v: any, k: string)=> boolean
        type WhereIterator = (item: object, k: string, v: any)=> boolean
        type OperatorsKey = "<" | ">" | ">=" | "==" | "!=" | "<=" | "<>" | "!==" | "===" | "in" | "like" | "between" | "array-contains"
        type Operators = {
            [K in OperatorsKey]: WhereIterator
        }
        type EloquentResolver = typeof Promise | object[]
        module Eloquent {
            class Model<O extends object> {
                readonly model : O
                readonly paths : keyof O
                /**
                 * @constructor
                 */
                constructor(model?: object | typeof Model);

                /**
                 * @description Create a new instance with this methods, but new props.
                 * @example
                 * var model = new Model({ user:"arcaelas" });
                 * model.macro("update", prop=>console.log(prop));
                 *
                 * // Only cloned macros.
                 * var user = model.create({
                 *  user:"arcaelas",
                 *  password:"1103"
                 * });
                 */
                create<M extends object>(model?: M): Model<M>;

                macro(key: string, fn: Function): this;

                /**
                 * @description Return literal model (No class)
                 */
                toJSON(): object;

                dd(): never;

                /**
                 * @description Compare some object with this model and return diff keys/values.
                 * @example
                 * var user = new Model({ username:"arcaelas", social:{ github:"arcaelas", facebook:"anonymous" } });
                 *
                 * var diff = user.diff({ social:{ github:"arcaelas", facebook:"arcaelas" } });
                 * // Expected: Model{{ social:{ facebook:"arcaelas" } }}
                 */
                diff<C extends object>(query: C): Model<C>;

                /**
                 * @description Print model in console and continue.
                 */
                dump(): this;

                /**
                 * @description The each method iterates over the path in the model and passes each item to a callback.
                 * NOTE: The order of keys isn't guaranted
                 * @example
                 * var user = new Model({ username:"arcaelas", social:{ github:"arcaelas", facebook:"anonymous" } });
                 * collection.eachPath((path, value)=>{
                 *  // path : 'username' | 'social.github' | 'social.facebook'
                 * });
                 */
                eachPath(callback: (path: string, value)=> any, deph?: number): this;

                /**
                 * @description The except method returns item except for those with the specified keys.
                 */
                except(executor?: string[] | FilterIterator): Model<{}>;

                /**
                 * @description The get method returns the item at a given key or index. If the key or index does not exist, "defaultValue" is returned
                 */
                get<K extends string, D extends any>(key: K, defaultValue?: D): any | D;

                /**
                 * @description Check if some key path in this model.
                 */
                has(key: string): boolean;

                /**
                 * @description Check if this model is empty.
                 */
                isEmpty(): boolean;
                
                /**
                 * @description Check if this model is not empty.
                 */
                isNotEmpty(): boolean;

                keys(): string[];
                
                /**
                 * @description Alias for a Array reducer, maped with key/value.
                 * NOTE: Order keys is not guaranted.
                 */
                map(executor: (value, key)=> any): Model<{}>;
                
                /**
                 * @description Compare Object with this value if all key/value is same.
                 * @example
                 * this.match({
                 *  someKey:"expected value",
                 *  someObject:{
                 *    insideKey:/^startWithThatWord/
                 *  },
                 * })
                 */
                match(query?: object): boolean;
                
                /**
                 * @description Map Object and replace keys values.
                 * @example
                 * var model = new Model({ username:"Alejandro Reyes", password:"12345", hobbies:['dream', 'eat', 'play with my hiddens friends.' ] });
                 * var mapped = model.mapWithKeys((key, value, object)=>{
                 *  if(key==='username') return [ key, "arcaelas" ];
                 *  else if(key==='password') return "*****";
                 *  else if(key==='hobbies') return [ key, [ "Nothing" ] ];
                 * });
                 * // Expected: Model<{ username:"arcaelas", password:"*****", hobbies:["Nothing"] }>
                 */
                mapWithKeys(executor?: (key, value, item)=>[string, any]): this;

                /**
                 * @description Same as Object.assign but no mutate original.
                 */
                merge(...values: object[]): this;

                /**
                 * @description Execute callback with self Model.
                 */
                pipe(fn: (m: this) => any): any;

                /**
                 * @description The pull method removes and returns an item from the collection by its key.
                 */
                pull(key: string, defaultValue?: any): any;

                reduce(fn: (value: any, key: string) => any, carry: any): any;

                /**
                 * @description Set Key/Value
                 */
                set<K extends string, V extends any>(key: K, value: V): V;

                /**
                 * @description Remove Some Key index.
                 */
                unset(key: any): any;
                
                values(): [];
                
                /**
                 * @description The when method will execute the given callback when the first argument given to the method evaluates to true.
                 * @example
                 * const user = new Model({ username:"arcaelas" });
                 * user.when( !user.has("password"), model => model.set("password", "myPassword"));
                 * user.toJSON();
                 * // { username:"arcaelas", password:"myPassword" }
                 */
                when(cond: boolean, then: (model: this) => void, calback: (model: this) => void): this;
                
                /**
                 * @description Execute when model is Empty
                 */
                whenEmpty(executor: (model: this) => void): this;
                
                /**
                 * @description Execute when model is not Empty
                 */
                whenNotEmpty(executor: (model: this) => void): this;
            }
            class Collection<C extends object[] | typeof Collection> {
                readonly items : C
                readonly length : number
                readonly operators: Operators
                /**
                 * @constructor
                 */
                constructor(items?: C);

                /**
                 * @description Add operator to "where" method
                 * @example
                 * collection.addOperator("match", (item, key, value)=> item[ key ]?.match( value ) )
                 *
                 * collection.where("username", 'match', /^arcaelas?$/)
                 */
                addOperator<T extends keyof Operators, CB extends Function>(operator: T, callback: CB): this;

                /**
                 * @description Create a new instance of the collection but including the "macro" that have been indicated.
                 */
                collect<T extends object[] | typeof Collection>(items?: T): Collection<T>;
                
                /**
                 * @description Add a custom callback to the collection to use it.
                 * @example
                 * collection.macro("some", function(cb){
                 *  return this.items.some(cb);
                 * });
                 * 
                 * collection.some(item=> item.id);
                 */
                macro(key: string, fn: Function): this;
                
                /**
                 * @description We will return all the elements contained in this collection.
                 */
                all(): object[];
                
                /**
                 * @description The chunk method breaks the collection into multiple, smaller collections of a given size
                 */
                chunk(size: number): Collection<object[]>;

                concat<T extends object[]>(...items: T): Collection<[...C[],...T]>;

                /**
                 * @description Count all items in this collection.
                 */
                count(): number;

                /**
                 *
                 * @example
                 * countBy("key.optionalChained")
                 * return {
                 *  optionalChainedValue:1
                 * }
                 */
                countBy(key: string): { [key: string]: number; };
                countBy(fn: MapIterator): { [key: string]: number; };

                /**
                * @description Print collection and exit.
                */
                dd(): never;

                /**
                * @description Print collection and continue.
                */
                dump(): this;

                /**
                 * @description The each method iterates over the items in the collection and passes each item to a callback,
                 * If you would like to stop iterating through the items, you may return false from your callback.
                 */
                each(fn: MapIterator): this;

                /**
                 * @description The every method may be used to verify that all elements of a collection pass a given truth test.
                 */
                every(fn: FilterIterator): boolean;

                /**
                 * @description The except method returns all items in the collection except for those with the specified keys
                 * @example
                 * const collection = collect({
                 *   product_id: 1,
                 *   price: 100,
                 *   discount: false,
                 * });
                 * const filtered = collection.except(['price', 'discount']);
                 * filtered.all();
                 * // { product_id: 1 }
                 *
                 * @example
                 * collect([1, 2, 3, 4])
                 *   .except(n=> n % 2 === 0)
                 *   .all();
                 * // [1, 3]
                 *
                 */
                except(executor?: string[] | FilterIterator): Collection<[]>;

                /**
                 * @description The filter method filters the collection using the given callback, keeping only those items that pass a given truth test
                 * @example
                 * const collection = collect([1, 2, 3, 4]);
                 * const filtered = collection.filter((value, key) => value > 2);
                 * filtered.all();
                 * // [3, 4]
                 */
                filter(fn: FilterIterator): Collection<[]>;

                /**
                 * @example
                 * this.find({
                 *  usernmae:"arcaelas",
                 *  email:/^arcae.*\@gmail\.com$/i
                 * })
                 */
                find<Q extends object, C extends true | false>(query: Q, collect?: C): C extends true ? Collection<object[]> : object[];

                /**
                 *
                 * @example
                 * this.findOne({
                 *  usernmae:"arcaelas",
                 *  email:/^arcae.*\@gmail\.com$/i
                 * })
                 * //{ username:"arcaelas", email:"arcaelas@gmail.com" }
                 */
                findOne(query?: object): object;

                /**
                 * @description The forPage method returns a new collection containing the items that would be present on a given page number.
                 * The method accepts the page number as its first argument and the number of items to show per page as its second argument:
                 * @example
                 * const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                 * const forPage = collection.forPage(2, 3);
                 * forPage.all();
                 * // [4, 5, 6]
                 */
                forPage(pageNumber: number, itemsCount?: number): Collection<[]>;

                /**
                 * @description The groupBy method groups the collection's items into multiple collections by a given key.
                 */
                groupBy(key: string): {
                    [k: string]: object[]
                };

                indexOf(executor: FilterIterator): number;

                /**
                 * @description The isEmpty method returns true if the collection is empty; otherwise, false is returned
                 */
                isEmpty(): boolean;

                /**
                 * @description The isNotEmpty method returns true if the collection is not empty; otherwise, false is returned
                 */
                isNotEmpty(): boolean;

                /**
                 * @description The join method joins the collection's values with a string.
                 * @example
                 * collect(['a', 'b', 'c']).join(', ', ', and ');
                 * // 'a, b, and c'
                 */
                join(key: string): string;
                join(key: string, separator?: string): string;
                join(key: string, separator: string, last?: string): string;

                /**
                 * @description The keys method returns all of the collection's keys
                 */
                keys(): keyof C;

                /**
                 * @description The map method iterates through the collection and passes each value to the given callback.
                 * The callback is free to modify the item and return it, thus forming a new collection of modified items
                 * @example
                 * collect(['a', 'b', 'c']).map(s=> s.toUpperCase());
                 * // ["A","B","C"]
                 *
                 * collect([{n: 1}, {n:2}, {N:3}]).map("n");
                 * // [1,2,null]
                 */
                map(fn: MapIterator): Collection<[]>;

                /**
                 * @description The max method returns the maximum value of a given key
                 */
                max(key: string): any;

                /**
                 * @description The min method returns the minimum value of a given key
                 */
                min(key: string): any;

                /**
                 * @description This method is the opposite of {@link Collection.find}.
                 * @example
                 * this.not({
                 *  status:"readed",
                 *  sender:/^admin.*\@support\.com/,
                 * })
                 */
                not<Q extends object, T extends boolean>(query: Q, collect: T): T extends true ? Collection<[]> : object[];

                /**
                 * @description This method scans each item within the collection and returns only the fields that have been filtered.
                 */
                only(keys: string[]): Collection<[]>;
                only(executor: Function): Collection<[]>;

                /**
                 *
                 * @description The pad method will fill the array with the given value until the array reaches the specified size.
                 * This method behaves like the array_pad (opens new window)PHP function.
                 * To pad to the left, you should specify a negative size.
                 * No padding will take place if the absolute value of the given size is less than or equal to the length of the array:
                 *
                 * @example
                 * const collection = collect(['A', 'B', 'C']);
                 * let filtered = collection.pad(2, 0);
                 * // [0, 'A', 'B', 'C', 0]
                 *
                 * filtered = collection.pad(2, 0, "left");
                 * // [0, 0, 'A', 'B', 'C']
                 *
                 * filtered = collection.pad(2, 0, "right");
                 * // ['A', 'B', 'C', 0, 0]
                 *
                 */
                pad(times?: number, fill?: any, dir?: "left" | "both" | "right"): this;

                /**
                 * @description The partition method may be combined with destructuring to separate elements that pass a given truth test from those that do not:
                 */
                partition(executor: FilterIterator): this;

                /**
                 * @description The pipe method passes the collection to the given callback and returns the result
                 * @example
                 * const collection = collect([1, 2, 3]);
                 * const piped = collection.pipe(items => items.sum());
                 * // 6
                 */
                pipe(fn: (collect: this) => any): any;

                /**
                 * @description The pop method removes and returns the last item from the collection:
                 */
                pop(): object;

                /**
                 * @example
                 * const collection = collect([2, 3]);
                 * collection.unshift(1);
                 * // Collection { [1,2,3] }
                 */
                unshift(...items: any[]): this;

                /**
                 * @example
                 * const collection = collect([1, 2]);
                 * collection.push(3);
                 * // Collection { [1,2,3] }
                 */
                push(...items: any[]): this;

                /**
                 * @description Get random elements, with the argument "length" the number of elements is indicated.
                 */
                random(length?: number): any;

                /**
                 * @description Same as Array Reducer.
                 */
                reduce(fn: (carry: any, value: any) => any, carry?: any): any;
                
                /**
                 * @description Opposite to {@link Eloquent.filter}
                 */
                reject(fn: FilterIterator): Collection<[]>;
                
                /**
                 * @description Same Array Shift
                 */
                shift(): any;
                
                /**
                 * @description Shuffle items
                 */
                shuffle(): this;

                /**
                 * @description Same Array Slice
                 */
                slice(start: number, count?: number): Collection<[]>;
                
                /**
                 * @description Sort the elements of the collection (This method mutates the collection).
                 */
                sort(key: string | Function, dir?: "asc" | "desc"): Collection<[]>;

                /**
                 * @description Same Array Splice
                 */
                splice(start?: number, deleteCount?: number): Collection<[]>;
                
                /**
                 * @description Sum the elements according to a specific key.
                 */
                sum(key?: string): number;

                /**
                 * @description The times method creates a new collection by invoking the callback a given amount of times
                 * @example
                 * const collection = collect([0]).times(10, number => number * 9);
                 * collection.all();
                 * // [0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
                 */
                times(n: number, fn: Function): this;

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
                unique(key: string): Collection<[]>;
                unique(executor: FilterIterator): Collection<[]>;

                /**
                 * @description The when method will execute the given callback when the first argument given to the method evaluates to true
                 * @example
                 * const collection = collect([1, 2, 3]);
                 * collection.when(true, collect => collect.push(4));
                 * collection.all();
                 * // [1, 2, 3, 4]
                 */
                when<B extends boolean, T extends (collect: this)=> any, F extends (collect: this)=> any>(
                    cond: B, then: T, failure?: F
                ): this;

                whenEmpty(executor: (collect: this)=> any): this;
                whenNotEmpty(executor: (collect: this)=> any): this;
                where<K extends string, V extends any>(key: K, value: V) : Collection<[]>
                where<K extends string, O extends OperatorsKey, V extends any>(key: K, operator: O, value: V) : Collection<[]>
            }
            class Eloquent<E extends EloquentResolver> extends Promise<E> {
                
                /**
                 * @constructor
                 * @param {E} collect 
                 */
                constructor(collect?: E);
                
                /**
                 * @description Add operator to "where" method
                 * @example
                 * collection.addOperator("match", (item, key, value)=> item[ key ]?.match( value ) )
                 *
                 * collection.where("username", 'match', /^arcaelas?$/)
                 */
                addOperator<T extends keyof Operators, CB extends Function>(operator: T, callback: CB): this;
                
                /**
                 * @description Create a new instance of the collection but including the "macro" that have been indicated.
                 */
                collect<T extends object[] | typeof Collection>(items?: T): Collection<T>;

                /**
                 * @description Add a custom callback to the collection to use it.
                 * @example
                 * collection.macro("some", function(cb){
                 *  return this.items.some(cb);
                 * });
                 * 
                 * collection.some(item=> item.id);
                 */
                macro(key: string, fn: Function): this;

                /**
                 * @description We will return all the elements contained in this collection.
                 */
                all(): PromiseLike<E>;

                /**
                 * @description The chunk method breaks the collection into multiple, smaller collections of a given size
                 */
                chunk(size: number): PromiseLike<object[]>;

                concat<T extends object[]>(...items: T): this;
 
                /**
                 * @description Count all items in this collection.
                 */
                count(): PromiseLike<number>;
 
                /**
                 *
                 * @example
                 * countBy("key.optionalChained")
                 * return {
                 *  optionalChainedValue:1
                 * }
                 */
                countBy(key: string): PromiseLike<{ [key: string]: number; }>;
                countBy(fn: MapIterator): PromiseLike<{ [key: string]: number; }>;

                /**
                * @description Print collection and exit.
                */
                dd(): never;

                /**
                * @description Print collection and continue.
                */
                dump(): this;

                /**
                 * @description The each method iterates over the items in the collection and passes each item to a callback,
                 * If you would like to stop iterating through the items, you may return false from your callback.
                 */
                each(fn: MapIterator): this;

                /**
                 * @description The every method may be used to verify that all elements of a collection pass a given truth test.
                 */
                every(fn: FilterIterator): PromiseLike<boolean>;

                /**
                 * @description The except method returns all items in the collection except for those with the specified keys
                 * @example
                 * const collection = collect({
                 *   product_id: 1,
                 *   price: 100,
                 *   discount: false,
                 * });
                 * const filtered = collection.except(['price', 'discount']);
                 * filtered.all();
                 * // { product_id: 1 }
                 *
                 * @example
                 * collect([1, 2, 3, 4])
                 *   .except(n=> n % 2 === 0)
                 *   .all();
                 * // [1, 3]
                 *
                 */
                except(executor?: string[] | FilterIterator): Eloquent<object[]>;

                /**
                 * @description The filter method filters the collection using the given callback, keeping only those items that pass a given truth test
                 * @example
                 * const collection = collect([1, 2, 3, 4]);
                 * const filtered = collection.filter((value, key) => value > 2);
                 * filtered.all();
                 * // [3, 4]
                 */
                filter(fn?: FilterIterator): Eloquent<object[]>;
 
                /**
                 * @example
                 * this.find({
                 *  usernmae:"arcaelas",
                 *  email:/^arcae.*\@gmail\.com$/i
                 * })
                 */
                find<Q extends object, C extends true | false>(query: Q, collect?: C): C extends true ? Eloquent<object[]> : object[];
 
                /**
                 *
                 * @example
                 * this.findOne({
                 *  usernmae:"arcaelas",
                 *  email:/^arcae.*\@gmail\.com$/i
                 * })
                 * //{ username:"arcaelas", email:"arcaelas@gmail.com" }
                 */
                findOne(query?: object): PromiseLike<object>;
 
                /**
                 * @description The forPage method returns a new collection containing the items that would be present on a given page number.
                 * The method accepts the page number as its first argument and the number of items to show per page as its second argument:
                 * @example
                 * const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                 * const forPage = collection.forPage(2, 3);
                 * forPage.all();
                 * // [4, 5, 6]
                 */
                forPage(pageNumber: number, itemsCount?: number): Eloquent<[]>;
 
                /**
                 * @description The groupBy method groups the collection's items into multiple collections by a given key.
                 */
                groupBy(key: string): PromiseLike<{
                    [k: string]: object[]
                }>;
 
                indexOf(executor: FilterIterator): PromiseLike<number>;
 
                /**
                 * @description The isEmpty method returns true if the collection is empty; otherwise, false is returned
                 */
                isEmpty(): PromiseLike<boolean>;
 
                /**
                 * @description The isNotEmpty method returns true if the collection is not empty; otherwise, false is returned
                 */
                isNotEmpty(): PromiseLike<boolean>;
 
                /**
                 * @description The join method joins the collection's values with a string.
                 * @example
                 * collect(['a', 'b', 'c']).join(', ', ', and ');
                 * // 'a, b, and c'
                 */
                join(key: string): PromiseLike<string>;
                join(key: string, separator?: string): PromiseLike<string>;
                join(key: string, separator: string, last?: string): PromiseLike<string>;

                /**
                 * @description The map method iterates through the collection and passes each value to the given callback.
                 * The callback is free to modify the item and return it, thus forming a new collection of modified items
                 * @example
                 * collect(['a', 'b', 'c']).map(s=> s.toUpperCase());
                 * // ["A","B","C"]
                 *
                 * collect([{n: 1}, {n:2}, {N:3}]).map("n");
                 * // [1,2,null]
                 */
                map(fn: MapIterator): Eloquent<object[]>;

                /**
                 * @description The max method returns the maximum value of a given key
                 */
                max(key: string): PromiseLike<number>;

                /**
                 * @description The min method returns the minimum value of a given key
                 */
                min(key: string): PromiseLike<number>;

                /**
                 * @description This method is the opposite of {@link Collection.find}.
                 * @example
                 * this.not({
                 *  status:"readed",
                 *  sender:/^admin.*\@support\.com/,
                 * })
                 */
                not<Q extends object, T extends boolean>(query: Q, collect: T): T extends true ? Eloquent<object[]> : PromiseLike<object[]>;

                /**
                 * @description This method scans each item within the collection and returns only the fields that have been filtered.
                 */
                only(keys: string[]): Eloquent<object[]>;
                only(executor: Function): Eloquent<object[]>;

                /**
                 *
                 * @description The pad method will fill the array with the given value until the array reaches the specified size.
                 * This method behaves like the array_pad (opens new window)PHP function.
                 * To pad to the left, you should specify a negative size.
                 * No padding will take place if the absolute value of the given size is less than or equal to the length of the array:
                 *
                 * @example
                 * const collection = collect(['A', 'B', 'C']);
                 * let filtered = collection.pad(2, 0);
                 * // [0, 'A', 'B', 'C', 0]
                 *
                 * filtered = collection.pad(2, 0, "left");
                 * // [0, 0, 'A', 'B', 'C']
                 *
                 * filtered = collection.pad(2, 0, "right");
                 * // ['A', 'B', 'C', 0, 0]
                 *
                 */
                pad(times?: number, fill?: any, dir?: "left" | "both" | "right"): this;

                /**
                 * @description The partition method may be combined with destructuring to separate elements that pass a given truth test from those that do not:
                 */
                partition(executor: FilterIterator): PromiseLike<object[][]>;

                /**
                 * @description The pipe method passes the collection to the given callback and returns the result
                 * @example
                 * const collection = collect([1, 2, 3]);
                 * const piped = collection.pipe(items => items.sum());
                 * // 6
                 */
                pipe(fn: (collect: this) => any): PromiseLike<any>;

                /**
                 * @description The pop method removes and returns the last item from the collection:
                 */
                pop(): PromiseLike<object>;

                /**
                 * @example
                 * const collection = collect([2, 3]);
                 * collection.unshift(1);
                 * // Eloquent [Promise] { [1,2,3] }
                 */
                unshift(...items: object[]): this;

                /**
                 * @example
                 * const collection = collect([1, 2]);
                 * collection.push(3);
                 * // Eloquent [Promise] { [1,2,3] }
                 */
                push(...items: any[]): this;

                /**
                 * @description Get random elements, with the argument "length" the number of elements is indicated.
                 */
                random(length?: number): PromiseLike<object[]>;

                /**
                 * @description Same as Array Reducer.
                 */
                reduce(fn: (carry: any, value: any) => any, carry?: any): PromiseLike<any>;
                
                /**
                 * 
                 * @description Opposite to {@link Eloquent.filter}
                 */
                reject(fn: FilterIterator): Eloquent<object[]>;
                
                /**
                 * @description Same Array Shift
                 */
                shift(): PromiseLike<object>;
                
                /**
                 * @description Shuffle items
                 */
                shuffle(): this;
                
                /**
                 * @description Same Array Slice
                 */
                slice(start: number, count?: number): Eloquent<object[]>;
                
                /**
                 * @description Sort the elements according to a specified function or key, the second argument represents the direction.
                 */
                sort(key: string | Function, dir?: "asc" | "desc"): Eloquent<object[]>;
                
                /**
                 * @description Same Array Splice
                 */
                splice(start?: number, deleteCount?: number): Eloquent<object[]>;

                /**
                 * @description Sum the elements according to a specific key.
                 */
                sum(key?: string): PromiseLike<number>;

                /**
                 * @description The times method creates a new collection by invoking the callback a given amount of times
                 * @example
                 * const collection = collect([0]).times(10, number => number * 9);
                 * collection.all();
                 * // [0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
                 */
                times(n: number, fn: Function): this;

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
                unique(key: string): Eloquent<[]>;
                unique(executor: FilterIterator): Eloquent<[]>;

                /**
                 * @description The when method will execute the given callback when the first argument given to the method evaluates to true
                 * @example
                 * const collection = collect([1, 2, 3]);
                 * collection.when(true, collect => collect.push(4));
                 * collection.all();
                 * // [1, 2, 3, 4]
                 */
                when<B extends boolean, T extends (collect: this)=> any, F extends (collect: this)=> any>(
                    cond: B, then: T, failure?: F
                ): this;

                whenEmpty(executor: (collect: this)=> any): this;
                whenNotEmpty(executor: (collect: this)=> any): this;
                where<K extends string, V extends any>(key: K, value: V) : Eloquent<object[]>
                where<K extends string, O extends OperatorsKey, V extends any>(key: K, operator: O, value: V) : Eloquent<object[]>
            }
        }
    }
}
export = Arcaela.Eloquent;