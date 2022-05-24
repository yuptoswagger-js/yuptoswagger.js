import * as yup from 'yup';
import { AnySchema } from "yup/lib/schema";

type YTSCompilerOptions = {
    debug: boolean;
}

class YTSCompiler {
    protected debug: boolean = false;
    constructor(options?: YTSCompilerOptions) {
        const keys: string[] = Object.keys(options || {});
        for (let key of keys) {
            switch (key) {
                case "debug":
                    this.debug = true;
                    break;
                default:
                    console.warn(`${key} is not recognized as a valid option property`)
            }
        }
    }
    compile(schema: AnySchema): any;
    compile(schema: AnySchema) {
        const schema_description = schema.describe();
        
    }
}

export default YTSCompiler;