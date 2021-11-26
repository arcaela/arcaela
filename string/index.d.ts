/**
 * @example
 * after("My name is Alejandro Reyes", "is")
 * // > " Alejandro Reyes"
 * @param {string} word
 * @param {string} union
 * @returns {string}
 */
export function after(word?: string, union?: string): string;
/**
 * @example
 * afterLast("The bus use gas for run.", "us");
 * // > "e gas for run."
 * @param {string} word
 * @param {string} union
 * @returns {string}
 */
export function afterLast(word?: string, union?: string): string;
/**
 * @example
 * before("My name is Alejandro Reyes", "Alejandro")
 * // > "My name is "
 * @param {string} word
 * @param {string} union
 * @returns {string}
 */
export function before(word?: string, union?: string): string;
/**
 * @example
 * beforeLast("The bus use gas for run.", "us");
 * // > "The bus "
 * @param {string} word
 * @param {string} union
 * @returns {string}
 */
export function beforeLast(word?: string, union?: string): string;
/**
 * @example
 * between("The bus use gas for run.", "The ", " use");
 * // > "bus"
 * @param {string} word
 * @param {string} afterAt
 * @param {string} beforeAt
 * @returns {string}
 */
export function between(word?: string, afterAt?: string, beforeAt?: string): string;
/**
 * @example
 * camelCase("alejandro-reyes")
 * // Expected: AlejandroReyes
 *
 * camelCase("alejandro      reyes", true)
 * // Expected: alejandroReyes
 *
 * camelCase("pr-op-name")
 * // Expected: prOpName
 * @param {string} word
 * @param {boolean} lower - True, if you want the first spell in lowerCase
 * @returns {string}
 */
export function camelCase(word?: string, lower?: boolean): string;
/**
 * @example
 * contains("My dear doggy is pretty.", "dear", "big") // true
 * @param {string} word
 * @param  {string[]} unions
 * @returns {boolean}
 */
export function contains(word?: string, ...unions: string[]): boolean;
/**
 * @example
 * containsAll("My dear doggy is pretty.", "dear", "big") // false
 * @param {string} word
 * @param  {string[]} unions
 * @returns {boolean}
 */
export function containsAll(word?: string, ...unions: string[]): boolean;
/**
 * @example
 * endsWith("image.gif", "gi", 1); // true
 *
 * endsWith(".vimrc", "rc", 2) // false
 * @param {string} word
 * @param {string} union
 * @param {number} endAt
 * @returns {boolean}
 */
export function endsWith(word?: string, union?: string, endAt?: number): boolean;
/**
 * @example
 * finish("/profile/arcaela", "/")
 * // "/profile/arcaela/"
 * @param {string} word
 * @param {string} union
 * @returns {string}
 */
export function finish(word?: string, union?: string): string;
/**
 * @example
 * humanize("Kąîő-Kęń")
 * // Expected: "Kaio-Ken"
 * @param {string} word
 * @returns {string}
 */
export function humanize(word: string): string;
/**
 * @description Is alias for slug!
 * @example
 * kebabCase("my first blog url");
 * // Expected: my-first-blog-url
 * @param {string} word
 * @returns {string}
 */
export function kebabCase(word?: string): string;
/**
 * @example
 * limit("Show my feed for more", 5);
 * // => "Show..."
 *
 * limit("Show my feed for more", 1000);
 * // => "Show my feed for more"
 * @param {string} word
 * @param {number} max
 * @param {string} union
 * @returns {string}
 */
export function limit(word?: string, max?: number, union?: string): string;
/**
 * @example
 * remove("The bear drink a beer with a bird.", "r")
 * // "The bea dink a bee with a bid."
 * @param {string} word
 * @param {string} removes
 * @returns {string}
 */
export function remove(word?: string, removes?: string): string;
/**
 * @example
 * remove("get down", "g", "B")
 * // "Bet down"
 * @param {string} word
 * @param {string} find
 * @param {string} replacer
 * @returns {string}
 */
export function replace(word?: string, find?: string, replacer?: string): string;
/**
 * @example
 * replaceArray("The school is open between ? to ?", ["10hr", "12 hr"], "?")
 * // "The school is open between 10hr to 12 hr"
 * @param {string} word
 * @param {string[]} array
 * @param {string} [match=?]
 * @returns {string}
 */
export function replaceArray(word?: string, array?: string[], match?: string): string;
/**
 *
 * @param {string} word
 * @returns {string}
 */
export function reverse(word?: string): string;
/**
 * @example
 * snakeCase("My constant name-is")
 * // Expected: my_constant_name_is
 * @param {string} word
 * @returns
 */
export function snakeCase(word?: string): string;
/**
 * @example
 * splice("https://github.com/arcaela/core/String", 19, 8, "arcaela");
 * // => "https://github.com/arcaela/core/String"
 * @param {string} word
 * @param {number} startAt
 * @param {number} endAt
 * @param {string} union
 * @returns {string}
 */
export function splice(word?: string, startAt?: number, endAt?: number, union?: string): string;
/**
 * @example
 * start("profile/arcaela/", "/")
 * // "/profile/arcaela/"
 * @param {string} word
 * @param {string} union
 * @returns {string}
 */
export function start(word?: string, union?: string): string;
/**
 * @example
 * startsWith("image.gif", "image"); // true
 *
 * startsWith(".vimrc", "vim", 1) // true
 * @param {string} word
 * @param {string} union
 * @param {number} startAt
 * @returns {boolean}
 */
export function startsWith(word?: string, union?: string, startAt?: number): boolean;
/**
 * @example
 * toPattern("^buh*")
 * // "\^buh\*";
 *
 * toPattern("^buh*", true)
 * // new Regex("\^buh\*");
 * @param {string} match
 * @param {string | boolean} regExp
 * @returns {RegExp|string}
 */
export function toPattern(match?: string, regExp?: string | boolean): RegExp | string;
/**
 * @example
 * ucfirst("my name is alejandro reyes")
 * // Expected: "My name is alejandro reyes"
 * @param {string} str
 * @returns {string}
 */
export function ucfirst(str?: string): string;
/**
 * @example
 * ucwords("alejandro reyes")
 * // Expected: "Alejandro Reyes"
 * @param {string} str
 * @returns {string}
 */
export function ucwords(str?: string): string;
