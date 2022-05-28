import * as yup from 'yup';
import { AnySchema, SchemaDescription } from "yup/lib/schema";
import { isArray, mergeObjects } from "./utils";

const __yuptoswagger__: any = { debug: false }

const { warn: warn_ } = console;
console.warn = (...args) => __yuptoswagger__.debug ? warn_(...args) : undefined

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
                    __yuptoswagger__.debug = true;
                    break;
                default:
                    console.warn(`${key} is not recognized as a valid option property`)
            }
        }
    }

    parse_tests(type: string, tests: any[]): any {
        const map: any = {
          "string": {
              "min": "minLength",
              "max": "maxLength",
              "email": "format",
              "url": "format",
              "uuid": "format",
              "matches": [ "pattern", "regex" ],
              // required: todo
          }
        }

        let properties: any = {};
        const type_map = map[type];
        for (let test of tests){
              const { name, params } = test;
            const match = type_map[name]
            if (!match) {
              console.warn(`[WARN] yuptoswagger.js: ignoring ${name}`)
              continue
            }
            if (isArray(match) && match.length == 2) {
              const [ key, value_key ] = match;
              const value = params[value_key]
              const value_str = value.toString ? value.toString() : value
              properties[key] = value_str
              continue
            }
            const value = params[name] || name
            properties[match] = value;
            console.log({ [match]: value })
        }
        return properties
    }
    parse_string_schema(type: string, properties: any) {
        const { oneOf, tests } = properties;
        
        const enum_ = oneOf;

        const schema: any = { type, enum: enum_ }

        return schema;
    }
    parse_object_schema(type: string, properties: any) {
      const schema = { type }
      const fields = []
      for (const field_key of Object.keys(properties.fields)) {
        const field: SchemaDescription = properties.fields[field_key];
        const parsed = this.compile(field)
        fields.push(parsed);
      }
      return { ...schema, fields }
    }
    parse_array_schema(type: string, properties: any) {
      const schema = { type }
      const innerType: any = properties.innerType;
      const items = this.compile(innerType)
      return { ...schema, items }
    }
    parse_spec_field(spec: any) {
      const parsed: any = { }
      
      const { nullable } = spec;

      if (nullable) parsed.nullable = nullable;
      
      return parsed;
    }
    isYupSchema<T extends AnySchema>(object: T): T | false {
      return object.__isYupSchema__ ? object : false;
    }
    compile(schema: AnySchema | SchemaDescription): any;
    compile(schema: AnySchema | SchemaDescription & { spec?: any }) {
      let schema_description = schema;
      
      const yupSchema = this.isYupSchema(schema as AnySchema)
      if (yupSchema) schema_description = yupSchema.describe();

      console.log(schema_description,'schema_description');

      const { type, ...properties } = schema_description;

      let swagger_schema: any = {}
      switch (type) {
          case "string": swagger_schema = this.parse_string_schema(type, properties); break;
          case "object": swagger_schema = this.parse_object_schema(type, properties); break;
          case "array": swagger_schema = this.parse_array_schema(type, properties); break;
          default: return { failed: true };
      }
      const from_test_properties = this.parse_tests(type, properties.tests);
      const spec_properties = this.parse_spec_field(properties!.spec);
      
      return mergeObjects({}, swagger_schema, from_test_properties, spec_properties);
    }
}

export default YTSCompiler;