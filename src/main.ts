import Parser from './frontend/parser';
import { evaluate } from './runtime/interpreter';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import Environment from "./runtime/environments";
const util = require('util');
import { promises as fsPromises } from 'fs';

const isTerminal = false
main(isTerminal);


async function main(isTerminal: boolean) {

    const rl = readline.createInterface({ input, output });

    try {

        const parser = new Parser();
        const env = new Environment()
        

        console.log('\nU-DirtyBit v0.1' + 'isTerminal: ' + isTerminal)
        if (isTerminal) {
            let i = 0
            while (true) {

                const input: string = await rl.question('> ');

                if (!input || input.includes('exit')) {
                    rl.close();
                    process.exit(0);
                }

                const program = parser.produceAST(input);
                // console.log(util.inspect(program, { depth: null, colors: true }));

                const result = evaluate(program, env)
                console.log(result);
            }
            
        } else {

            const input = await fsPromises.readFile('src/testFile/test.txt', 'utf8');
            const program = parser.produceAST(input);
            console.log(util.inspect(program, { depth: null, colors: true }));
            const result = evaluate(program, env)
            console.log(util.inspect(result, { depth: null, colors: true})); // depth: null shows full depth
        }
       

    } catch (e) {
        console.log('Exception occurred: ', e);
    } finally {
        rl.close();
    }
}