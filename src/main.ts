import Parser from './frontend/parser';
import { evaluate } from './runtime/interpreter';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
const util = require('util');

main();


async function main() {

    const rl = readline.createInterface({ input, output });

    try {

        const parser = new Parser();

        console.log('\nU-DirtyBit v0.1')
        let i = 0
        while (true) {

            const input: string = await rl.question('> ');

            if (!input || input.includes('exit')) {
                rl.close();
                process.exit(0);
            }
            
            const program = parser.produceAST(input);
            console.log(util.inspect(program, { depth: null, colors: true }));

            const result = evaluate(program)
            console.log(result);
        }
    } catch (e) {
        console.log('Exceptin occurred: ', e);
    } finally {
        rl.close();
    }
}