import {RuntimeVal, NumberVal} from './values'
import {
    AssignmentExpression,
    BinaryExpr,
    CallExpression, FunctionDeclaration,
    Identifier,
    NumericLiteral, ObjectLiteral,
    Program,
    Statement,
    VariableDeclaration
} from '../frontend/ast'
import Environment from "./environments";
import {
    evaluateAssignment,
    evaluateBinaryExpression,
    evaluateCallExpression,
    evaluateIdentifier,
    evaluateObjectExpression
} from "./evaluation/expressions";
import {evaluateFunctionDeclaration, evaluateProgram, evaluateVariableDeclaration} from "./evaluation/statments";

export function evaluate(astNode: Statement, env: Environment): RuntimeVal {

    switch( astNode.kind ) {
        case 'NumericLiteral':
            return { 
                 value: ((astNode as NumericLiteral).value),
                 type: 'number',  
                } as NumberVal;
        case 'Identifier':
            return evaluateIdentifier(astNode as Identifier, env)
        case 'ObjectLiteral':
            return evaluateObjectExpression(astNode as ObjectLiteral, env)
        case 'CallExpression':
            return evaluateCallExpression(astNode as CallExpression, env)
        case 'BinaryExpr':
            return evaluateBinaryExpression(astNode as BinaryExpr, env);
        case 'AssignmentExpression':
            return evaluateAssignment(astNode as AssignmentExpression, env)
        case 'Program':
            return evaluateProgram(astNode as Program, env);
        // handle statements
        case 'VariableDeclaration':
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env);
        case 'FunctionDeclaration':
            return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);
        default:
            console.error('This AST Node has not been setup for interpretation. ', astNode)
            process.exit(1)
        // case 'CallExpr':
        // case 'UnaryExpr':
        // case 'FunctionDeclaration':
    }
}