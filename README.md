versions:
    - node: v20.11.0
    - npm: 10.2.4

run:  
    - Deno: deno run -A lexer.ts
    - Node: -ts-node lexer.ts