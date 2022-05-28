import * as yup from 'yup';
import { AnySchema, SchemaDescription } from "yup/lib/schema";
import { isArray, mergeObjects } from "./utils";

const __yuptoswagger__: any = { debug: false }

type YTSCompilerOptions = {
    debug: boolean;
}

class YTSCompiler {
    protected debug: boolean = false;
    protected defaultOptions: any = { debug: false }

    constructor(options_: YTSCompilerOptions) {
        const options = options_ || this.defaultOptions
        const keys: string[] = Object.keys(options);
        for (let key of keys) {
            switch (key) {
                case "debug":
                    __yuptoswagger__.debug = options.debug;
                    break;
                default:
                    console.warn(`${key} is not recognized as a valid option property`)
            }
        }
    }
    warn = (...args: any[]) => __yuptoswagger__.debug ? console.warn(...args) : undefined
    log = (...args: any[]) => __yuptoswagger__.debug ? console.log(...args) : undefined
    error = (...args: any[]) => __yuptoswagger__.debug ? console.error(...args) : undefined
    
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
          },
          "number": {
            "min": [ "minimum", "min", "more" ],
            "max": [ "maximum", "max", "less" ],
          },
          "array": {
            "min": "minItems",
            "max": "maxItems"
          },
          "object": { }
        }

        let properties: any = {};
        const type_map = map[type];
        for (let test of tests){
            const { name, params } = test;
            const match = type_map[name]
            if (!match) {
              this.warn(`[WARN] yuptoswagger.js: ignoring ${name}`)
              continue
            }
            if (isArray(match) && match.length > 2) {
              const [ key, ...value_keys ] = match;
              const value_key = value_keys.find(
                (key: string) => params[key] !== undefined ? true : false 
              )
              const value = params[value_key]
              properties[key] = value
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
        }
        return properties
    }
    parse_string_schema(type: string, properties: any) {
        const { oneOf } = properties;
        
        if( oneOf && oneOf.length ) return { type, enum: oneOf };

        return { type };
    }
    parse_number_schema(type: 'number', properties: any) {
      const integer_test_found: boolean = properties.tests.some(
        (test: any) => test.name === "integer"
      )
      if (integer_test_found) return { type: "integer" }
      return { type }
    }
    parse_object_schema(type: string, properties: any) {
      const schema = { type }
      const obj_properties: any = {};
      const required: string[] = [];
      for (const field_key of Object.keys(properties.fields)) {
        const field: SchemaDescription = properties.fields[field_key];
        const field_required_test_found: Boolean = field.tests.some(
          (test: any) => test.name === "required"
        )
        if (field_required_test_found) required.push(field_key)
        const parsed = this.compile(field)
        obj_properties[field_key] = parsed;
      }
      return { 
        ...schema, 
        properties: obj_properties, 
        required 
      }
    }
    parse_array_schema(type: string, properties: any) {
      const schema = { type, items: {} }

      const parse_innerType: boolean = Boolean(properties.innerType)
      if (parse_innerType) {
        const innerType: any = properties.innerType;
        const items = this.compile(innerType)
        mergeObjects(schema, { items })
      }

      const parse_oneOf: boolean = properties.oneOf && properties.oneOf.length > 0;
      if (parse_oneOf) {
        const oneOf = this.parse_oneOf_field(properties.oneOf as any[]);
        mergeObjects(schema.items, { oneOf });
      }
      
      return schema
    }
    parse_spec_field(spec: any) {
      const parsed: any = { }
      
      const { nullable } = spec;

      if (nullable) parsed.nullable = nullable;
      
      return parsed;
    }
    parse_oneOf_field(fields: any[]) {
      const parsed_fields: any[] = [];
      for (let field of fields){
        const parsed = this.compile(field);
        parsed_fields.push(parsed);
      }
      return parsed_fields
    }
    isYupSchema<T extends AnySchema>(object: T): T | false {
      return object.__isYupSchema__ ? object : false;
    }
    compile(schema: AnySchema | SchemaDescription): any;
    compile(schema: AnySchema | SchemaDescription & { spec?: any }) {
      let schema_description = schema;
      
      const yupSchema = this.isYupSchema(schema as AnySchema)
      if (yupSchema) schema_description = yupSchema.describe();

      this.log(schema_description,'schema_description', __yuptoswagger__.debug);

      const { type, ...properties } = schema_description;

      let swagger_schema: any = {}
      switch (type) {
          // todo: ref case
          // todo: oneOf case
          // todo: allow users to add manually properties that are not mapped with yup (eg. uniqueItems)
          // todo: find workaround for non-usual usage of yup ( eg. yup.array().oneOf(...).of(...) )
          // todo: find workaround for binary/byte format of string
          case "string": swagger_schema = this.parse_string_schema(type, properties); break;
          case "number": swagger_schema = this.parse_number_schema(type, properties); break;
          case "object": swagger_schema = this.parse_object_schema(type, properties); break;
          case "array": swagger_schema = this.parse_array_schema(type, properties); break;
          default: return { failed: true };
      }
      const from_test_properties = this.parse_tests(type, properties.tests);

      const parse_spec: boolean = properties.hasOwnProperty("spec");
      if (parse_spec) {
        const spec_properties = this.parse_spec_field(properties!.spec);
        mergeObjects(swagger_schema, spec_properties);
      }

      return mergeObjects(swagger_schema, from_test_properties);
    }
}

export default YTSCompiler;