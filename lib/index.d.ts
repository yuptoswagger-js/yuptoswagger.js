import { AnySchema } from 'yup/lib/schema';

declare type YTSCompilerOptions = {
    debug: boolean;
};
declare class YTSCompiler {
    protected debug: boolean;
    constructor(options?: YTSCompilerOptions);
    parse_string_schema(type: string, properties: any): any;
    compile(schema: AnySchema): any;
}

export { YTSCompiler as default };
