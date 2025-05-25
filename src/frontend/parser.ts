import  { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier } from './ast'
import { Token, TokenType } from './types'
import { tokenize } from './lexer'

export default class Parser {

    private tokens: Token[] = []

    private not_eof(): boolean {
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

    public produceAST(sourceCode: string): Program {

        this.tokens = tokenize(sourceCode)
        const program: Program = {
            kind: 'Program',
            body: [],
        };

        //parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }
        
        return program;
    }

    private parse_stmt(): Stmt {
        // skip to parse_expr
        return this.parse_expr();
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

    private parse_expr(): Expr {
        return this.parse_additive_expr();
    }

    /* exmaples:
        ( 10 + - 5 ) - 5
        ( 10 + ( 10 - fooBar() ) ) - 5 
    */
    private parse_additive_expr(): Expr {
        //parse left hand side to support recursive prescidence
        let left = this.parse_primary_expr();

        while (this.at().value == '+' || this.at().value == '-') {

            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            
            left = {
                kind: 'BinaryExpr',
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_primary_expr(): Expr {

        const tk = this.at().type;
        
        switch (tk) {
            case TokenType.Identifier:
                return { 
                    kind: 'Identifier', 
                    symbol: this.eat().value 
                } as Identifier;
            case TokenType.Number:
                return { 
                    kind: 'NumericLiteral', 
                    value: parseFloat(this.eat().value),
                 } as NumericLiteral;
        
            default:
                console.error('Unexpected token found during parsing: ', this.at());
                //trick the compiler for TS
                process.exit(1);
        }
    }
}