import { TokenType, Token } from "./types";

export function token (value = '', type: TokenType): Token {
    return {value, type}
}

export function isAlpha(src: string) {
    return src.toLocaleUpperCase() != src.toLocaleLowerCase();
}

export function isInteger(src: string) {
   const c = src.charCodeAt(0);
   const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
   return (c >= bounds[0] && c <= bounds[1]);
}

export function isSkippable(str: string) {
    return str == ' ' || str == '\n' || str == '\t'
}