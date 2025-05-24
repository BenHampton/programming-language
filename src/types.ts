export enum TokenType {
    Number,
    Identifier,
    Equals,
    OpenParen, CloseParen,
    BinaryOperator,
    Let,
}

export interface Token {
    value: string
    type: TokenType
}