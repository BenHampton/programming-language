import { RuntimeVal } from "./values";

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor(parentENV?: Environment) {
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
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