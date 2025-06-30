import {
    AssignmentExpression,
    BinaryExpr,
    CallExpression,
    Expr, FunctionDeclaration,
    Identifier,
    MemberExpr,
    NumericLiteral,
    ObjectLiteral,
    Program,
    Property,
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
                return this.parseVariableDeclaration();
            case TokenType.Fn:
                return this.parseFunctionDeclaration()
            default:
                return this.parseExpression();
        }
    }
    
    private parseFunctionDeclaration(): Statement {
        
        this.eat();
        
        const name = this.expect(TokenType.Identifier, 'Expected function name following function keyword').value
        const args = this.parseArgs();
        
        const params: string[] = [];
        
        for (const arg of args)  {
            if (arg.kind != 'Identifier') {
                console.log(arg);
                throw 'Inside function declaration expected parameter to be of type String';
            }
            params.push( (arg as Identifier).symbol );
        }
        
        this.expect(TokenType.OpenBrace, 'Expected function body following declaration');
        
        const body: Statement[] = [];
        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parseStatement());
        }
        
        this.expect(TokenType.CloseBrace, 'Closing brace expected inside function declaration');
        
        const fn = {
            body: body,
            name: name,
            parameters: params,
            kind: 'FunctionDeclaration'
        } as FunctionDeclaration;
        
        return fn
    }

    // LET IDENTIFIER
    // (CONST | LET) IDENTIFIER = EXPR
    private parseVariableDeclaration(): Statement {
        
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
    - Object
    - MultiplicativeExpr
    - Call
    - Member
    - PrimaryExpr
    -
    - unset below?
    -
    - LogicalExpr
    - ComparisionExpr
    - AdditiveExpr
    - UnaryExpr
    */    
    private parseExpression(): Expr {
        return this.parseAssignmentExpression()
    }
    
    private parseAssignmentExpression(): Expr {
        const left = this.parseObjectExpression();

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
    
    private parseObjectExpression(): Expr {
        // { Prop[] }
        
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parseAdditiveExpression();
        }
        
        this.eat();
        const properties = new Array<Property>();
        
        while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
            // 3 cases
            // 1: { key : val }
            // 2: { key : val, key2: val }
            // 3: { key }
            
            const key = this.expect(TokenType.Identifier, 'Object literal key expected').value
            
            
            if (this.at().type == TokenType.Comma) { //allows shorthand key: pair -> { key, }
                this.eat();
                properties.push({
                    key, 
                    kind: 'Property'
                });
                continue;
            } else if (this.at().type == TokenType.CloseBrace) { //allows shorthand key: pair -> { key }
                properties.push({
                    key,
                    kind: 'Property'
                });
                continue;
            }

            // { key : val }
            this.expect(TokenType.Colon, 'Missing colon following identifier in ObjectExpr');
            const value = this.parseExpression();
            
            properties.push({
                kind: 'Property',
                value: value,
                key
            })
            
            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "Expected comma or closing brackets following property")
            }
        }
        
        this.expect(TokenType.CloseBrace, "Object literal missing closing brace.")
        
        return { 
            kind: "ObjectLiteral",
            properties: properties,
        } as ObjectLiteral
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
        let left = this.parseCallMemberExpression();

        while (this.at().value == '/' || this.at().value == '*' || this.at().value == '%') {

            const operator = this.eat().value;
            const right = this.parseCallMemberExpression();

            left = {
                kind: 'BinaryExpr',
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }
    
    // foo.x ()
    // reason to parse a member is to get rid of 'foo.x' and then check for Left Paren
    private parseCallMemberExpression(): Expr {
        const member = this.parseMemberExpression();
        
        if (this.at().type == TokenType.OpenParen) {
            return this.parseCallExpression(member);
        }
        
        return member;
    }

    private parseCallExpression(caller: Expr): Expr {
        
        let callExpr: Expr = {
            kind: 'CallExpression',
            caller,
            args: this.parseArgs()
        } as CallExpression;
        
        if ( this.at().type == TokenType.OpenParen) {
            callExpr = this.parseCallExpression(callExpr);
        }
        
        return callExpr;
    }

    //fn add (x,y) {} => 'x' and 'y' are the arguments
    private parseArgs(): Expr[] {
        this.expect(TokenType.OpenParen, 'Expected open parenthesis');
        
        const args = this.at().type == TokenType.CloseParen ? [] : this.parseArgumentsList()
        
        this.expect(TokenType.CloseParen, 'Missing closing parenthesis inside arguments list');
        return args;
    }

    private parseArgumentsList(): Expr[] {
        const args = [this.parseAssignmentExpression()];
        
        while (this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parseAssignmentExpression());
        }
        
        return args;
    }

    private parseMemberExpression(): Expr {
        
        let object = this.parsePrimaryExpression()
        
        while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
            
            const operator = this.eat();
            
            let property: Expr;
            let computed: boolean;
            
            //non-computed values aka object.expr
            if ( operator.type == TokenType.Dot ) {
                computed = false
                //get identifier
                property = this.parsePrimaryExpression()
                
                if (property.kind != 'Identifier') {
                    throw 'Cannot use dor operator without right hand side being and identifier'
                }
            } else { //this allows chaining -> obj[computedValue]
                computed = true;
                property = this.parseExpression();
                this.expect(TokenType.CloseBracket, 'Missing closing bracket in computed value.');
            }

            object = {
                kind: 'MemberExpression',
                object,
                property,
                computed
            } as MemberExpr
        }
        
        return object;
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