import { ValueType, RuntimeVal, NumberVal, NullVal } from './values'
import { BinaryExpr, NodeType, NumericLiteral, Program, Statement } from '../frontend/ast'

const NullValue = {
    type: 'null',
    value: 'null'
} as NullVal

function evaluateProgram(program: Program): RuntimeVal {
    console.log('evaluateProgram')
    let lastEvaluated: RuntimeVal = NullValue

        // for (const statement of program.body) {
        //     lastEvaluated = evaluate(statement)
        // }

         program.body.forEach(statement => {
            lastEvaluated = evaluate(statement)
         })
    return lastEvaluated;
}

function evaluateNumbericBinaryExpression(leftHandSide: NumberVal, rightHandSide: NumberVal, operator: string): NumberVal {
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

function evaluateBinaryExpression(binaryOperator: BinaryExpr): RuntimeVal {
    
    const leftHandSide = evaluate(binaryOperator.left);
    const rightHandSide = evaluate(binaryOperator.right);

    if (leftHandSide.type === 'number' && rightHandSide.type === 'number') {
        return evaluateNumbericBinaryExpression(
            leftHandSide as NumberVal,
            rightHandSide as NumberVal, 
            binaryOperator.operator);
    }

    return NullValue
}

export function evaluate(astNode: Statement): RuntimeVal {

    switch( astNode.kind ) {
        case 'NumericLiteral':
            return { 
                 value: ((astNode as NumericLiteral).value),
                 type: 'number',  
                } as NumberVal;
        case 'NullLiteral':
            return NullValue
        case 'BinaryExpr':
            return evaluateBinaryExpression(astNode as BinaryExpr);
        case 'Program':
            return evaluateProgram(astNode as Program);
        default:
            console.error('This AST Node has not been setup for interpretation. ', astNode)
            process.exit(1)
        // case 'NullLiteral':
        // case 'Identifier':
        // case 'BinaryExpr':
        // case 'CallExpr':
        // case 'UnaryExpr':
        // case 'FunctionDeclaration':
    }
}