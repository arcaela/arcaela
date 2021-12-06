/**
 * @example
 * Str.after("The bus use gas for run.", "us ");
 * // "use gas for run."
 * 
 * @example
 * Str.after("The bus use gas for run.", /us\s+/);
 * // "use gas for run."
 * @param {string} text 
 * @param {string | RegExp} matcher 
 * @returns {string}
 */

function after(text = "", matcher = "") {
    let matches = text.split( matcher );
        matches.shift();
    return matches.join( matcher );
};

/**
 * @example
 * afterLast("The bus use gas for run.", "us");
 * // > "e gas for run."
 * 
 * @example
 * afterLast("The bus use gas for run.", /Gas\s+/i);
 * // > "for run."
 * @param {string} text 
 * @param {string | RegExp} matcher 
 * @returns {string}
 */
function afterLast(text = "", matcher = "") {
    let matches = text.split( matcher );
    return matches.pop();
};

/**
 * @example
 * before("My name is Alejandro Reyes", "Alejandro")
 * // "My name is "
 * @param {string} text 
 * @param {string | RegExp} matcher 
 * @returns {string}
 */
function before(text = "", matcher = "") {
    let matches = text.split( matcher );
    return matches.shift();
};

/**
 * @example
 * beforeLast("The bus use gas for run.", "us");
 * // "The bus "
 * @param {string} text 
 * @param {string | RegExp} matcher 
 * @returns {string}
 */
function beforeLast(text = "", matcher = "") {
    let matches = text.split( matcher );
    matches.pop();
    return matches.join( matcher );
};

/**
 * @example
 * between("My name is Alejandro Reyes and i'm developer.", /is\s+?/, " and");
 * // > "Alejandro Reyes"
 * @param {string} text 
 * @param {string | RegExp} match_a 
 * @param {string | RegExp} match_b 
 * @returns {string}
 */
function between(text = "", match_a = "", match_b = "") {
    return beforeLast( after(text, match_a), match_b )
};

/**
 * @example
 * CamelCase("alejandro-reyes")
 * // Expected: AlejandroReyes
 * 
 * CamelCase("alejandro      reyes", true)
 * // Expected: alejandroReyes
 * 
 * CamelCase("pr-op-name")
 * // Expected: prOpName
 * @param {string} word 
 * @param {boolean} lower - True, if you want the first spell in lowerCase
 * @returns {string}
 */
function CamelCase(word = "", lower = false) {
    return word.replace(/[-_]/g, " ")
        .replace(/^([a-z\u00E0-\u00FC])|[\s-_]+([a-z\u00E0-\u00FC])/g, $1 => $1.toUpperCase())
        .replace(/\s+/g, "")
        .replace(/^[a-z]/i, $1 => !lower ? $1 : $1.toLocaleLowerCase())
};

/**
 * @example
 * contains("My dear doggy is pretty.", "dear", "big") // true
 * @param {string} text 
 * @param  {(string | RegExp)[]} matches 
 * @returns {boolean}
 */
function contains(text = "", ...matches) {
    for (let some of matches.flat())
        if( text.match( some )) return true;
    return false;
};

/**
 * @example
 * containsAll("My dear doggy is pretty.", "dear", "big") // false
 * @param {string} text 
 * @param  {string[]} matches 
 * @returns {boolean}
 */
function containsAll(text = "", ...matches) {
    for (let some of matches.flat())
        if (!text.match(some)) return false;
    return true;
};

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
function startsWith(word = "", union = "", startAt = 0) {
    return word.slice(startAt).indexOf(union) === 0;
};

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
function endsWith(word = "", union = "", endAt = 0) {
    endAt = Math.max(0, endAt);
    word = endAt > 0 ? word.slice(0, endAt * -1) : word;
    return (word.length - union.length) === word.indexOf(union);
};

/**
 * @example
 * Str.start("github.com/arcaelas/core/String", "https://");
 * // "https://github.com/arcaelas/core/String"
 * 
 * @example
 * Str.start("https://github.com/arcaelas/core/String", "https://");
 * // "https://github.com/arcaelas/core/String"
 * @param {string} text
 * @param {string} union 
 * @returns {string}
 */
function start(text = "", union = "") {
    return union + ( after( text, union ) || text );
};

/**
 * @example
 * end("/profile/arcaelas", "/")
 * // "/profile/arcaelas/"
 * @param {string} text 
 * @param {string} union 
 * @returns {string}
 */
function end(text = "", union = "") {
    return ( beforeLast( text, union ) || text).concat( union );
};

/**
 * @example
 * humanize("Kąîő-Kęń")
 * // Expected: "Kaio-Ken"
 * @param {string} word 
 * @returns {string}
 */
function humanize(text) {
    let specials = 'ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźžĄÀÁÄÂÃÅÆĂĆČĈĘÈÉËÊĜĤÌÍÏÎĴŁĽŃŇÒÓÖŐÔÕÐØŚȘŞŠŜŤȚŢŬÙÚÜŰÛÑŸÝÇŻŹŽß',
        normals = 'aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzzAAAAAAAAACCCEEEEEGHIIIIJLLNNOOOOOOOOSSSSSTTTUUUUUUNYYCZZZ'.split("").concat("ss");
    return text.replace(/.{1}/g, $1 => {
        var index = specials.indexOf($1);
        return index === -1 ? $1 : normals[index];
    });
};

/**
 * @description Is alias for slug!
 * @example
 * kebabCase("my first blog url");
 * // Expected: my-first-blog-url
 * @param {string} text 
 * @returns {string}
 */
function kebabCase(text = "") {
    return text.replace(/[\s-_]+/g, "-")
        .toLowerCase();
};

/**
 * @example
 * limit("Show my feed for more", 5);
 * // "Show..."
 * 
 * limit("Show my feed for more", 1000);
 * // "Show my feed for more"
 * @param {string} text 
 * @param {number} max 
 * @param {string} union
 * @returns {string}
 */
function limit(text = "", max = Infinity, union = "...") {
    union ||= '...';
    max = ~~max;
    return text.length > max ? text.slice(0, max).trim() + union : text;
};

/**
 * @example
 * remove("The bear drink a beer with a bird.", "r")
 * // "The bea dink a bee with a bid."
 * @param {string} text 
 * @param {string} removes 
 * @returns {string}
 */
function remove(text = "", removes = "") {
    return text.replace(removes, "")
};

/**
 * @example
 * embed("The school is open between ? to ?", ["10hr", "12 hr"], "?")
 * // "The school is open between 10hr to 12 hr"
 * 
 * @example
 * embed("The school is open between ? to ? and days ?", ["10hr", "12 hr"], "?")
 * // "The school is open between 10hr to 12 hr and days ?"
 * @param {string} text 
 * @param {string[]} placers 
 * @param {string} [match=?]
 * @returns {string}
 */
function embed(text = "", array = [], match = "?") {
    for(let place of array)
        text.replace( match, place );
    return text;
};

/**
 * @example
 * reverse("123456") // 654321
 * @param {string} text 
 * @returns {string}
 */
function reverse(text = "") {
    return text.split("").reverse().join("");
};

/**
 * @example
 * snakeCase("My constant name-is")
 * // Expected: my_constant_name_is
 * @param {string} text 
 * @returns 
 */
function snakeCase(text = "") {
    return kebabCase(text).replace(/[-_]+/g, "_");
};

/**
 * @example
 * splice("https://github.com/arcaelas/core/String", 19, 8, "arcaelas");
 * // "https://github.com/arcaelas/core/String"
 * @param {string} word 
 * @param {number} startAt 
 * @param {number} endAt 
 * @param {string} union 
 * @returns {string}
 */
function splice(word = "", startAt = 0, endAt = 0, union = "") {
    var arr = word.split("");
    arr.splice(~~startAt, ~~endAt, union);
    return arr.join('');
};

/**
 * @example
 * ucfirst("my name is alejandro reyes")
 * // Expected: "My name is alejandro reyes"
 * @param {string} str 
 * @returns {string}
 */
function ucfirst(str = "") {
    return str.toLocaleLowerCase().slice(1)
        .padStart(str.length, str[0].toUpperCase());
};

/**
 * @example
 * ucwords("alejandro reyes")
 * // Expected: "Alejandro Reyes"
 * @param {string} str 
 * @returns {string}
 */
function ucwords(str = "") {
    return str.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, ($1) => $1.toUpperCase())
};

function toPattern(text: string | RegExp, string: string | boolean='') : string | RegExp {
    text = text instanceof RegExp ? text : new RegExp( text.replace(/([@.*-?/()|\\\[\]])/g, "\\$1") );
    return string===true ? String( text ).replace(/^\/(.*)\/([isgm]+)?$/, "$1") :
        new RegExp( text, typeof string==='string' ? string : null );
};

export = {
    after,
    afterLast,
    before,
    beforeLast,
    between,
    CamelCase,
    contains,
    containsAll,
    endsWith,
    end,
    humanize,
    kebabCase,
    limit,
    remove,
    replace,
    embed,
    reverse,
    snakeCase,
    splice,
    start,
    startsWith,
    toPattern,
    ucfirst,
    ucwords,
};


/************************     Development     *****************************/

function replace(word = "", find = "", replacer = "") {
    return word.replace(toPattern(find, "g"), replacer);
};

/**
 * @description Use this function to group spells into array.
 * @example
 * var sentence = "Lorem ipsum, is a example words.";
 * crop(sentence, 3)
 * //Expected: ["Lore","m ip","sum,"," is ","a ex","ampl","e wo","rds."]
 * @param {string} word 
 * @param {number} n 
 * @returns {string[]}
 */
function crop(word = "", n = 1) {
    return new Array(Math.ceil(word.length / n))
        .fill("").map((e, i) => word.slice(i * n, n * (i + 1)));
};

/**
 * @example
 * put("Hellworld", 4, "o ");
 * // "Hello world"
 * @param {string} word 
 * @param {number} index 
 * @param {string} union 
 * @returns {string}
 */
function put(word = "", index = 0, union = "") {
    return splice(word, index, 0, union);
};


function wrap(word: string = "", options) : string {
    options = {
        width: 75,
        cut: false,
        seperator: "\n",
        preserveSpaces: false,
        trailingSpaces: false,
        ...options,
    };

    let result = '';
    if (options.width <= 0) return word;
    else if (!options.cut) {
        let words = word.split(/\s+/g),
            current_column = 0;
        while (words.length) {
            if ((1 + words[0].length + current_column > options.width) && current_column > 0) {
                if (options.preserveSpaces) {
                    result += ' ';
                    current_column++;
                } else if (options.trailingSpaces) {
                    while (current_column < options.width) {
                        result += ' ';
                        current_column++;
                    }
                }
                result += options.seperator;
                current_column = 0;
            }
            if (current_column > 0)
                result += ' ', current_column++;
            result += words[0],
                current_column += words[0].length,
                words.shift();
        }
    } else {
        let index = 0;
        while (index < word.length) {
            if (index % options.width == 0 && index > 0) result += options.seperator;
            result += word.charAt(index);
            index++;
        }
        if (options.trailingSpaces) {
            while (index % options.width > 0) {
                result += ' ';
                index++;
            }
        }
    }
    return result;
};