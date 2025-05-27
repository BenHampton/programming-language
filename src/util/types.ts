export enum TokenType {
    //Lirerals
    Null,
    Number,
    Identifier,

    //Keywords
    Let,

    //Groupings * Operators
    BinaryOperator,
    Equals,
    OpenParen, 
    CloseParen,
    EOF, //signify End Of File
}

export interface Token {
    value: string
    type: TokenType
}