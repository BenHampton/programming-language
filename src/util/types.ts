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
    Comma,
    Colon,
    Semicolon,
    OpenParen, 
    CloseParen,
    OpenBrace,
    CloseBrace,
    EOF, //signify End Of File
}

export interface Token {
    value: string
    type: TokenType
}