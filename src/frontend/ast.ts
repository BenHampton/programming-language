export type NodeType = 
'Program' | 
'NumericLiteral' | 
'Identifier' | 
'BinaryExpr' | 
'CallExpr' | 
'UnaryExpr' | 
'FunctionDeclaration';


//statments will not return a value
export interface Stmt {
    kind: NodeType,
}

export interface Program extends Stmt {
    kind: 'Program';
    body: Stmt[];
}

//extends Stmt
export interface Expr extends Stmt {
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