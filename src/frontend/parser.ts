import  { Statement, Program, Expr, BinaryExpr, NumericLiteral, Identifier, NullLiteral } from './ast'
import { Token, TokenType } from '../util/types'
import { tokenize } from './lexer'

export default class Parser {

    private tokens: Token[] = []

    private notEOF(): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }

    //returns current token
    private at() {
        const tk = this.tokens[0] as Token;
        // console.log('at(): ', tk)
        return tk;
    }

    //advance to the next token
    private eat() {
        const prev = this.tokens.shift() as Token;
        // console.log('eat(): ', prev)
        return prev;
    }

    private expect(type: TokenType, message: string) {
        const prev = this.tokens.shift() as Token;
        if (!prev  || prev.type != type) {
            console.error('Parser Error. Expected Type: '+ type +' \n', message)
            process.exit(1)
        }
        return prev;
    }

    public produceAST(sourceCode: string): Program {

        this.tokens = tokenize(sourceCode)
        const program: Program = {
            kind: 'Program',
            body: [],
        };

        //parse until end of file
        while (this.notEOF()) {
            program.body.push(this.parseStatment());
        }
        
        return program;
    }

    private parseStatment(): Statement {
        // skip to parseExpression
        return this.parseExpression();
    }

        /*Order of Prescidence:
        - AssignmentExpr
        - MemberExpr
        - FunctionCall
        - LogicalExpr
        - ComparisionExpr
        - AdditiveExpr
        - MiltiplicitaveExpr
        - UnaryExpr
        - PrimaryExpr
    */

    private parseExpression(): Expr {
        return this.parseAdditiveExpression();
    }

    /* exmaples:
        ( 10 + - 5 ) - 5
        ( 10 + ( 10 - fooBar() ) ) - 5 
    */
    private parseAdditiveExpression(): Expr {
        //parse left hand side to support recursive prescidence
        let left = this.parseMultipliciotaveExpression();

        while (this.at().value == '+' || this.at().value == '-') {

            const operator = this.eat().value;
            const right = this.parseMultipliciotaveExpression();

            left = {
                kind: 'BinaryExpr',
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parseMultipliciotaveExpression(): Expr {
        //parse left hand side to support recursive prescidence
        let left = this.parsePrimaryExpression();

        while (this.at().value == '/' || this.at().value == '*' || this.at().value == '%') {

            const operator = this.eat().value;
            const right = this.parsePrimaryExpression();

            left = {
                kind: 'BinaryExpr',
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parsePrimaryExpression(): Expr {

        const tk = this.at().type;
        
        switch (tk) {
            case TokenType.Identifier:
                return { 
                    kind: 'Identifier', 
                    symbol: this.eat().value 
                } as Identifier;
            case TokenType.Null:
                this.eat(); //advance past null KEYWORD
                return { 
                    kind: 'NullLiteral', 
                    value: 'null'
                } as NullLiteral;
            case TokenType.Number:
                return { 
                    kind: 'NumericLiteral', 
                    value: parseFloat(this.eat().value),
                 } as NumericLiteral;

            case TokenType.OpenParen:
                this.eat(); // eat the opening paren
                const value = this.parseExpression();
                 //closing paren
                this.expect(
                    TokenType.CloseParen, 
                    "Unexpected token found inside of parenthesised expression. Expected clsoing parenthesis");
                return value;
        
            default:
                console.error('Unexpected token found during parsing: ', this.at());
                process.exit(1);
        }
    }
}