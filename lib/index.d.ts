import { AnySchema } from 'yup/lib/schema';

declare type YTSCompilerOptions = {
    debug: boolean;
};
declare class YTSCompiler {
    protected debug: boolean;
    constructor(options?: YTSCompilerOptions);
    compile(schema: AnySchema): any;
}

export { YTSCompiler as default };
