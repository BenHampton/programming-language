import {MK_BOOLEAN, MK_NULL, RuntimeVal} from "./values";

function setUpScope(env: Environment) {
    // create Default global environments
    env.declareVar('true', MK_BOOLEAN(true), true)
    env.declareVar('false', MK_BOOLEAN(false), true)
    env.declareVar('null', MK_NULL(), true)
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor(parentENV?: Environment) {
        const global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
        
        if (global) {
            setUpScope(this);
        }
    }

    public declareVar(varName: string, value: RuntimeVal, isConstant: boolean): RuntimeVal {
        if (this.variables.has(varName)) {
            throw `Can not declare ${varName}. As its already defined`
        }

        this.variables.set(varName, value)
        if (isConstant) {
            this.constants.add(varName)
        }
        
        return value
    }

    public assignVar(varName: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varName);
        if (env.constants.has(varName)) {
            throw `Can not resign variable ${varName} as its already defined as a constant`
        }
        env.variables.set(varName, value)
        return value
    }

    public lookUpVar(varName: string): RuntimeVal {
        const env = this.resolve(varName);
        return env.variables.get(varName) as RuntimeVal
    }

    public resolve(varName: string): Environment {
        if (this.variables.has(varName)) {
            return this;
        }

        if (this.parent === undefined) {
            throw `Can not resolve ${varName}. As it does not exist`
        }

        return this.parent.resolve(varName)
    }
}