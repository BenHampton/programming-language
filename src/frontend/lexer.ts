import fs from 'fs';
// import * as fs from 'fs';
import { Token, TokenType } from '../util/types';
import { KEYWORDS } from '../util/constants';
import { token, isInteger, isAlpha, isSkippable } from '../util/utils';

//let x = 45 + ( foo + bar )
// [ letToken, IdentifierTk, EqualsToken, NumberToken ]

export function tokenize (sourceCode: string): Token[] {

    const tokens = new Array<Token>();
    const src = sourceCode.split('');
    // console.log('src: ', src)


    //build each token until end of file
    while ( src.length > 0 ) {
        
        if (src[0] == '(') {
            tokens.push(token(src.shift(), TokenType.OpenParen))
        } else if (src[0] == ')') {
            tokens.push(token(src.shift(), TokenType.CloseParen))
        } else if (src[0] == '+' || src[0] == '-' || src[0] == '*' || src[0] == '/' || src[0] == '%') {
            tokens.push(token(src.shift(), TokenType.BinaryOperator))
        } else if (src[0] == '=' ) {
            tokens.push(token(src.shift(), TokenType.Equals))
        } else if (src[0] == ';' ) {
            tokens.push(token(src.shift(), TokenType.Semicolon))
        }else {

            //handle multi character tokens .ie '>='

            //build number token
            if (isInteger(src[0])) {

                let num = '';
                while ( src.length > 0 && isInteger(src[0])) {
                    num += src.shift();
                }

                tokens.push(token(num, TokenType.Number));

            } else if (isAlpha(src[0])) {

                let identifier = ''; //foo or let
                while ( src.length > 0 && isAlpha(src[0])) {
                    identifier += src.shift();
                }

                //check for reserved keywords
                const reserved = KEYWORDS[identifier]
                if (typeof reserved === 'number') {
					tokens.push(token(identifier, reserved));
				} else {
					// Unrecognized name must mean user defined symbol.
					tokens.push(token(identifier, TokenType.Identifier));
				}
            } else if (isSkippable(src[0])) {
                //skip character
                src.shift()
            } else {
                console.log('Unrecognized character found in source: ', src[0])
                // Deno.exit(1)
                process.exit(1)
            }

        }
    }
    
    tokens.push({ type: TokenType.EOF, value: 'EndOfFile' });
    return tokens
}

// const source = await Deno.readTextFile('./test.txt')
const source = fs.readFileSync('src/testFile/test.txt', 'utf8');

// for (const token of tokenize(source)) {
//     console.log(token)
// }