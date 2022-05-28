import { AnySchema, SchemaDescription } from "yup/lib/schema";
declare type YTSCompilerOptions = {
    debug: boolean;
};
declare class YTSCompiler {
    protected debug: boolean;
    constructor(options?: YTSCompilerOptions);
    parse_tests(type: string, tests: any[]): any;
    parse_string_schema(type: string, properties: any): {
        type: string;
        enum: any;
    } | {
        type: string;
        enum?: undefined;
    };
    parse_number_schema(type: 'number', properties: any): {
        type: string;
    };
    parse_object_schema(type: string, properties: any): {
        fields: any[];
        type: string;
    };
    parse_array_schema(type: string, properties: any): {
        type: string;
        items: {};
    };
    parse_spec_field(spec: any): any;
    parse_oneOf_field(fields: any[]): any[];
    isYupSchema<T extends AnySchema>(object: T): T | false;
    compile(schema: AnySchema | SchemaDescription): any;
}
export default YTSCompiler;
