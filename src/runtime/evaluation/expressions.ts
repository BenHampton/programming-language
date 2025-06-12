import {MK_NULL, NumberVal, RuntimeVal} from "../values";
import {BinaryExpr, Identifier} from "../../frontend/ast";
import Environment from "../environments";
import {evaluate} from "../interpreter";

export function evaluateNumericBinaryExpression(leftHandSide: NumberVal, rightHandSide: NumberVal, operator: string): NumberVal {
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

export function evaluateBinaryExpression(binaryOperator: BinaryExpr, env: Environment): RuntimeVal {

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

export function evaluateIdentifier(ident: Identifier, env: Environment): RuntimeVal {
    const val = env.lookUpVar(ident.symbol);
    return val;
}

