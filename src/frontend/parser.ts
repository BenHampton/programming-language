import {
    AssignmentExpression,
    BinaryExpr,
    Expr,
    Identifier,
    NumericLiteral,
    Program,
    Statement,
    VariableDeclaration
} from './ast'
import {Token, TokenType} from '../util/types'
import {tokenize} from './lexer'

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
            program.body.push(this.parseStatement());
        }
        
        return program;
    }

    private parseStatement(): Statement {
        // skip to parseExpression
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_variable_declaration();
            default:
                return this.parseExpression();
        }
    }

    // LET IDENTIFIER
    // (CONST | LET) IDENTIFIER = EXPR
    private parse_variable_declaration(): Statement {
        
        const isConstant = this.eat().type == TokenType.Const;
        const identifier = this.expect(
            TokenType.Identifier, 
            "Expected identifier name following let | const keywords.")
            .value;
        
        if (this.at().type == TokenType.Semicolon) {
            
            this.eat(); //expect semicolon
            if (isConstant) {
                throw "Must assign value to constant expression. No value provided"
            }
            
            return {
                kind: "VariableDeclaration",
                identifier,
                constant: false,
                value: undefined //do not need to pass this since it is inherited
            } as VariableDeclaration
        }
        
        this.expect(TokenType.Equals, "Expected equals token identifier in variable declaration.")
        const declaration = {
            kind: "VariableDeclaration",
            value: this.parseExpression(),
            constant: isConstant,
            identifier,
        } as VariableDeclaration;
        
        this.expect(TokenType.Semicolon, "Variable Declaration statement must end with semicolon.")
        return declaration;
    }

        /*Order of Prescidence:
        - AssignmentExpr
        - MemberExpr
        - FunctionCall
        - LogicalExpr
        - ComparisionExpr
        - AdditiveExpr
        - MultiplicativeExpr
        - UnaryExpr
        - PrimaryExpr
    */    
    private parseExpression(): Expr {
        return this.parseAssignmentExpression()
    }
    
    private parseAssignmentExpression(): Expr {
        const left = this.parseAdditiveExpression(); //switch this out with Objects

        if (this.at().type == TokenType.Equals) {
            this.eat();
            const value = this.parseAssignmentExpression()
            return {
                value,
                assignee: left,
                kind: 'AssignmentExpression',
            } as AssignmentExpression;
        }

        return left;
    }

    /* example:
        ( 10 + - 5 ) - 5
        ( 10 + ( 10 - fooBar() ) ) - 5 
    */
    private parseAdditiveExpression(): Expr {
        //parse left hand side to support recursive precedence
        let left = this.parseMultiplicativeExpression();

        while (this.at().value == '+' || this.at().value == '-') {

            const operator = this.eat().value;
            const right = this.parseMultiplicativeExpression();

            left = {
                kind: 'BinaryExpr',
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parseMultiplicativeExpression(): Expr {
        //parse left hand side to support recursive precedence
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