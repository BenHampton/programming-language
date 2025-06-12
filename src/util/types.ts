export enum TokenType {
    //Literals
    Number,
    Identifier,
    //Keywords
    Let,
    Const,

    //Groupings * Operators
    BinaryOperator,
    Equals,
    Semicolon,
    OpenParen, 
    CloseParen,
    EOF, //signify End Of File
}

export interface Token {
    value: string
    type: TokenType
}