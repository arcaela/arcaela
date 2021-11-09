/**
 * @example
 * after("My name is Alejandro Reyes", "is")
 * // > " Alejandro Reyes"
 * @param {string} word 
 * @param {string} union 
 * @returns {string}
 */
function after(word = "", union = "") {
    return word.slice(word.indexOf(union) + union.length);
};

/**
 * @example
 * afterLast("The bus use gas for run.", "us");
 * // > "e gas for run."
 * @param {string} word 
 * @param {string} union 
 * @returns {string}
 */
function afterLast(word = "", union = "") {
    return word.slice(word.lastIndexOf(union) + union.length);
};

/**
 * @example
 * before("My name is Alejandro Reyes", "Alejandro")
 * // > "My name is "
 * @param {string} word 
 * @param {string} union 
 * @returns {string}
 */
function before(word = "", union = "") {
    return word.slice(0, word.indexOf(union) + union.length);
};

/**
 * @example
 * beforeLast("The bus use gas for run.", "us");
 * // > "The bus "
 * @param {string} word 
 * @param {string} union 
 * @returns {string}
 */
function beforeLast(word = "", union = "") {
    return word.slice(0, word.lastIndexOf(union) + union.length);
};

/**
 * @example
 * between("The bus use gas for run.", "The ", " use");
 * // > "bus"
 * @param {string} word 
 * @param {string} afterAt 
 * @param {string} beforeAt 
 * @returns {string}
 */
function between(word = "", afterAt = "", beforeAt = "") {
    return word.slice(
        word.indexOf(afterAt) + afterAt.length,
        word.lastIndexOf(beforeAt)
    );
};

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
function camelCase(word = "", lower = false) {
    return word.replace(/^([a-z\u00E0-\u00FC])|[\s-_]+([a-z\u00E0-\u00FC])/g, $1 => $1.toUpperCase())
        .replace(/[-_\s]+/g, "")
        .replace(/^[a-z]/i, $1 => !lower ? $1 : $1.toLocaleLowerCase())
};

/**
 * @example
 * contains("My dear doggy is pretty.", "dear", "big") // true
 * @param {string} word 
 * @param  {string[]} unions 
 * @returns {boolean}
 */
function contains(word = "", ...unions) {
    for (let some of unions.flat()) {
        if (typeof some === 'string' && word.includes(some))
            return true;
    }
    return false;
};

/**
 * @example
 * containsAll("My dear doggy is pretty.", "dear", "big") // false
 * @param {string} word 
 * @param  {string[]} unions 
 * @returns {boolean}
 */
function containsAll(word = "", ...unions) {
    for (let some of unions.flat()) {
        if (typeof some !== 'string' || !word.includes(some))
            return false;
    }
    return true;
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
 * finish("/profile/arcaela", "/")
 * // "/profile/arcaela/"
 * @param {string} word 
 * @param {string} union 
 * @returns {string}
 */
function finish(word = "", union = "") {
    return word.replace(toPattern(union + '$'), "") + union;
};

/**
 * @example
 * humanize("Kąîő-Kęń")
 * // Expected: "Kaio-Ken"
 * @param {string} word 
 * @returns {string}
 */
function humanize(word) {
    let specials = 'ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźžĄÀÁÄÂÃÅÆĂĆČĈĘÈÉËÊĜĤÌÍÏÎĴŁĽŃŇÒÓÖŐÔÕÐØŚȘŞŠŜŤȚŢŬÙÚÜŰÛÑŸÝÇŻŹŽß',
        normals = 'aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzzAAAAAAAAACCCEEEEEGHIIIIJLLNNOOOOOOOOSSSSSTTTUUUUUUNYYCZZZ'.split("").concat("ss");
    return word.replace(/.{1}/g, $1 => {
        var index = specials.indexOf($1);
        return index === -1 ? $1 : normals[index];
    });
};

/**
 * @description Is alias for slug!
 * @example
 * kebabCase("my first blog url");
 * // Expected: my-first-blog-url
 * @param {string} word 
 * @returns {string}
 */
function kebabCase(word = "") {
    return word.replace(/[\s-_]+/g, "-")
        .toLowerCase();
};

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
function limit(word = "", max = Infinity, union = "...") {
    union ||= '...';
    max = ~~max;
    return word.length > max ? word.slice(0, max).trim() + union : word;
};

/**
 * @example
 * remove("The bear drink a beer with a bird.", "r")
 * // "The bea dink a bee with a bid."
 * @param {string} word 
 * @param {string} removes 
 * @returns {string}
 */
function remove(word = "", removes = "") {
    return replace(word, removes, "");
};

/**
 * @example
 * remove("get down", "g", "B")
 * // "Bet down"
 * @param {string} word 
 * @param {string} find 
 * @param {string} replacer 
 * @returns {string}
 */
function replace(word = "", find = "", replacer = "") {
    return word.replace(toPattern(find, "g"), replacer);
};

/**
 * @example
 * replaceArray("The school is open between ? to ?", ["10hr", "12 hr"], "?")
 * // "The school is open between 10hr to 12 hr"
 * @param {string} word 
 * @param {string[]} array 
 * @param {string} [match=?]
 * @returns {string}
 */
function replaceArray(word = "", array = [], match = "??") {
    for (let m of array)
        word = word.replace(toPattern(match, true), m);
    return word;
};

/**
 * 
 * @param {string} word 
 * @returns {string}
 */
function reverse(word = "") {
    return word.split("").reverse().join("");
};

/**
 * @example
 * snakeCase("My constant name-is")
 * // Expected: my_constant_name_is
 * @param {string} word 
 * @returns 
 */
function snakeCase(word = "") {
    return word.replace(/[\s-_]+/g, "_")
        .toLowerCase();
};

/**
 * @example
 * splice("https://github.com/arcaelas/core/String", 19, 8, "arcaela");
 * // => "https://github.com/arcaela/core/String"
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
 * start("profile/arcaela/", "/")
 * // "/profile/arcaela/"
 * @param {string} word 
 * @param {string} union 
 * @returns {string}
 */
function start(word = "", union = "") {
    return union + word.replace(toPattern("^" + union, true));
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
 * toPattern("^buh*")
 * // "\^buh\*";
 * 
 * toPattern("^buh*", true)
 * // new Regex("\^buh\*");
 * @param {string} match 
 * @param {string | boolean} regExp 
 * @returns {RegExp|string}
 */
function toPattern(match = "", regExp = '') {
    match = match.replace(/([@.*-?/()|\\\[\]])/g, "\\$1");
    return regExp ? new RegExp(match, typeof regExp === 'string' ? regExp : '') : match;
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


module.exports = {
    after,
    afterLast,
    before,
    beforeLast,
    between,
    camelCase,
    contains,
    containsAll,
    endsWith,
    finish,
    humanize,
    kebabCase,
    limit,
    remove,
    replace,
    replaceArray,
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
 * // => "Hello world"
 * @param {string} word 
 * @param {number} index 
 * @param {string} union 
 * @returns {string}
 */
function put(word = "", index = 0, union = "") {
    return splice(word, index, 0, union);
};

/**
 * 
 * @param {string} word 
 * @param {{
 *  seperator:string
 *  width: number
 *  cut: boolean
 *  preserveSpaces: boolean
 *  trailingSpaces: boolean
 * }} options 
 * @returns {string}
 */
function wrap(word = "", options = {}) {
    options.width ||= 75;
    options.cut ||= false;
    options.seperator ||= "\n";
    options.preserveSpaces ||= false;
    options.trailingSpaces ||= false;
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