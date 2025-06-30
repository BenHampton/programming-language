import {FunctionValue, MK_NULL, NativeFunctionValue, NumberVal, ObjectVal, RuntimeVal} from "../values";
import {AssignmentExpression, BinaryExpr, CallExpression, Expr, Identifier, ObjectLiteral} from "../../frontend/ast";
import Environment from "../environments";
import {evaluate} from "../interpreter";

export function evaluateNumericBinaryExpression(leftHandSide: NumberVal, rightHandSide: NumberVal, operator: string): NumberVal {
    // console.log('op', operator)
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

export function evaluateAssignment(node: AssignmentExpression, env: Environment): RuntimeVal {
    if (node.assignee.kind != 'Identifier') {
        throw `Invalid left hand side assignment expression ${JSON.stringify(node.assignee)}.`;
    }
    
    const varName = (node.assignee as Identifier).symbol
    return env.assignVar(varName, evaluate(node.value, env));
}

export function evaluateObjectExpression(obj: ObjectLiteral, env: Environment): RuntimeVal {
    
    const object = { type: 'object', properties: new Map() } as ObjectVal;
    
    for (const { key, value } of obj.properties) {
        
        //handles valid key: pair
        
        //shorthand -> { foo } === { foo: foo }
        const runtimeVal = ( value == undefined ) ? env.lookUpVar(key) : evaluate(value, env);
        object.properties.set(key, runtimeVal)
    }
    
    return object;
}

export function evaluateCallExpression(callExpr: CallExpression, env: Environment): RuntimeVal {

    const args = callExpr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(callExpr.caller, env);

    if (fn.type == 'native-fn') {
        
        const result = (fn as NativeFunctionValue).call(args, env)
        return result;
    } 
    
    if (fn.type == 'function') {

        const func = fn as FunctionValue; 
        const scope = new Environment(func.declarationEnv);
        
        //create the variables for the parameters list
        for (let i = 0; i < func.parameters.length; i++) {
            //TODO check the bounds of args here
            //verify arity of function
            const varname = func.parameters[i];
            scope.declareVar(varname, args[i], false)
        }
        let results: RuntimeVal = MK_NULL();
        //evaluate the function body line by line aka statment by statement
        for (const stmt of func.body) {
            results = evaluate(stmt, scope);
        }
        
        return results;
    }
    
    throw 'Cannot call value that is not a function: ' + JSON.stringify(fn)
}