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

    parse_string_schema(type: string, properties: any) {
        const { oneOf } = properties;
        
        const enum_ = oneOf;

        const schema: any = { type, enum: enum_ }
        return schema;
    }

    compile(schema: AnySchema): any;
    compile(schema: AnySchema) {
        const schema_description = schema.describe();
        const { type, ...properties } = schema_description;
        const swagger_schema: any = {};
        
        swagger_schema.type = type;
        switch (type) {
            case "string": return this.parse_string_schema(type, properties)
        }
        return { failed: true }
    }
}

export default YTSCompiler;