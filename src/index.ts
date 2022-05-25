import * as yup from 'yup';
import { AnySchema, SchemaDescription } from "yup/lib/schema";

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
            console.log("TEST: ", test)
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
        const from_test_properties = this.parse_tests(type, tests);
      
        console.log({ from_test_properties })
        return mergeObjects({}, schema, from_test_properties);
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
    isYupSchema<T extends AnySchema>(object: T): T | false {
      return object.__isYupSchema__ ? object : false;
    }
    compile(schema: AnySchema | SchemaDescription): any;
    compile(schema: AnySchema | SchemaDescription) {
      let schema_description = schema;
      
      const yupSchema = this.isYupSchema(schema as AnySchema)
      if (yupSchema) schema_description = yupSchema.describe();

      console.log(schema_description,'schema_description');

      const { type, ...properties } = schema_description;

      switch (type) {
          case "string": return this.parse_string_schema(type, properties)
          case "object": return this.parse_object_schema(type, properties)
      }
      return { failed: true }
    }
}

export default YTSCompiler;

const isObject = (item: any) => {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

const isArray = (item: any) => {
  return (item && typeof item === 'object' && Array.isArray(item))
}

const mergeObjects: any = (target: any, ...sources: any) => {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) target[key] = {}
          mergeObjects(target[key], source[key])
        } 
        else if (isArray(source[key]) && isArray(target[key])) {
          target[key] = target[key].concat(source[key]) 
        }
        else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
  
    return mergeObjects(target, ...sources);
  }