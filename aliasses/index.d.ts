/**
 *
 * @param {Object.<string, string>} aliases
 */
export function addAliases(aliases: {
    [x: string]: string;
}): void;
/**
 *
 * @param {string} alias
 * @param {string} target
 */
export function addAlias(alias: string, target: string): void;
export function reset(): void;
/**
 *
 * @param {{ "base": string }} [options]
 */
export function init(options?: {
    "base": string;
}): void;
