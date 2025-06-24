export type NodeType = 
    
//Statments
'Program' |
'VariableDeclaration' |
    
//Expressions
"AssignmentExpression" |
    
//Literals
'Property' |
'ObjectLiteral' |    
'NumericLiteral' | 
'Identifier' |
'BinaryExpr' | 
'CallExpr' | 
'UnaryExpr' | 
'FunctionDeclaration';


//statements will not return a value
export interface Statement {
    kind: NodeType,
}

export interface Program extends Statement {
    kind: 'Program';
    body: Statement[];
}

export interface VariableDeclaration extends Statement {
    kind: 'VariableDeclaration';
    constant: boolean,
    identifier: string,
    value?: Expr
}

//extends Statement
export interface Expr extends Statement {
}

// let x = { foo: "bAR" }
// x.foo = "foo bar" -> member expression
export interface AssignmentExpression extends Expr {
    kind: 'AssignmentExpression',
    assignee: Expr,
    value: Expr,
}

export interface BinaryExpr extends Expr {
    kind: 'BinaryExpr'
    left: Expr;
    right: Expr;
    operator: string;
}

export interface Identifier extends Expr {
    kind: 'Identifier'
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: 'NumericLiteral'
    value: number;
}

export interface Property extends Expr {
    kind: 'Property'
    key: string,
    value?: Expr
}

export interface ObjectLiteral extends Expr {
    kind: 'ObjectLiteral'
    properties: Property[]
}