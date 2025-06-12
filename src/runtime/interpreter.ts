import {RuntimeVal, NumberVal} from './values'
import {
    BinaryExpr,
    Identifier,
    NumericLiteral,
    Program,
    Statement,
    VariableDeclaration
} from '../frontend/ast'
import Environment from "./environments";
import {evaluateBinaryExpression, evaluateIdentifier} from "./evaluation/expressions";
import {evaluateProgram, evaluateVariableDeclaration} from "./evaluation/statments";

export function evaluate(astNode: Statement, env: Environment): RuntimeVal {

    switch( astNode.kind ) {
        case 'NumericLiteral':
            return { 
                 value: ((astNode as NumericLiteral).value),
                 type: 'number',  
                } as NumberVal;
        case 'Identifier':
            return evaluateIdentifier(astNode as Identifier, env)
        case 'BinaryExpr':
            return evaluateBinaryExpression(astNode as BinaryExpr, env);
        case 'Program':
            return evaluateProgram(astNode as Program, env);
            
            // handle statements
        case 'VariableDeclaration':
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env);
        default:
            console.error('This AST Node has not been setup for interpretation. ', astNode)
            process.exit(1)
        // case 'NullLiteral':
        // case 'BinaryExpr':
        // case 'CallExpr':
        // case 'UnaryExpr':
        // case 'FunctionDeclaration':
    }
}