import {ValueType, RuntimeVal, NumberVal, MK_NULL} from './values'
import {BinaryExpr, Identifier, NodeType, NumericLiteral, Program, Statement} from '../frontend/ast'
import Environment from "./environments";

function evaluateProgram(program: Program, env: Environment): RuntimeVal {
    console.log('evaluateProgram')
    let lastEvaluated: RuntimeVal = MK_NULL()

         program.body.forEach(statement => {
            lastEvaluated = evaluate(statement, env)
         })
    return lastEvaluated;
}

function evaluateNumericBinaryExpression(leftHandSide: NumberVal, rightHandSide: NumberVal, operator: string): NumberVal {
    console.log('op', operator)
    let result: number = 0;
    if (operator === '+')
        result = leftHandSide.value + rightHandSide.value
    else if (operator === '-')
        result = leftHandSide.value - rightHandSide.value
    else if (operator === '*')
        result = leftHandSide.value * rightHandSide.value
    else if (operator === '/') //todo: Division by zero checks
        result = leftHandSide.value / rightHandSide.value
    else if (operator === '%')
        result = leftHandSide.value % rightHandSide.value

    return { 
        value: result, 
        type: 'number'
    }
}

function evaluateBinaryExpression(binaryOperator: BinaryExpr, env: Environment): RuntimeVal {
    
    const leftHandSide = evaluate(binaryOperator.left, env);
    const rightHandSide = evaluate(binaryOperator.right, env);

    if (leftHandSide.type === 'number' && rightHandSide.type === 'number') {
        return evaluateNumericBinaryExpression(
            leftHandSide as NumberVal,
            rightHandSide as NumberVal, 
            binaryOperator.operator);
    }

    return MK_NULL()
}

function evaluateIdentifier(ident: Identifier, env: Environment): RuntimeVal {
    const val = env.lookUpVar(ident.symbol);
    return val;
}

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