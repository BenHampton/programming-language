import {FunctionDeclaration, Program, Statement, VariableDeclaration} from "../../frontend/ast";
import Environment from "../environments";
import {FunctionValue, MK_NULL, RuntimeVal} from "../values";
import {evaluate} from "../interpreter";

export function evaluateProgram(program: Program, env: Environment): RuntimeVal {
    console.log('evaluateProgram')
    let lastEvaluated: RuntimeVal = MK_NULL()

    program.body.forEach(statement => {
        lastEvaluated = evaluate(statement, env)
    })
    return lastEvaluated;
}

export function evaluateVariableDeclaration (varDeclration: VariableDeclaration, env: Environment): RuntimeVal {
    
    const value = varDeclration.value ? 
        evaluate(varDeclration.value, env) : MK_NULL();
    
    return env.declareVar(varDeclration.identifier, value, varDeclration.constant)
}

export function evaluateFunctionDeclaration (functionDeclration: FunctionDeclaration, env: Environment): RuntimeVal {
    
    const fn = {
        type: 'function',
        name: functionDeclration.name,
        parameters: functionDeclration.parameters,
        declarationEnv: env,
        body: functionDeclration.body,
    } as FunctionValue
    
    return env.declareVar(functionDeclration.name, fn, true);
}