import { TokenType } from "./types";

export const KEYWORDS: Record<string, TokenType> = {
    'let': TokenType.Let,
    'null': TokenType.Null,
}
