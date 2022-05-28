'use strict';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

const isObject = item => {
  return item && typeof item === 'object' && !Array.isArray(item);
};
const isArray = item => {
  return item && typeof item === 'object' && Array.isArray(item);
};
const mergeObjects = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {};
        mergeObjects(target[key], source[key]);
      } else if (isArray(source[key]) && isArray(target[key])) {
        target[key] = target[key].concat(source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return mergeObjects(target, ...sources);
};

const _excluded = ["type"];
const __yuptoswagger__ = {
  debug: false
};
const {
  warn: warn_
} = console;

console.warn = (...args) => __yuptoswagger__.debug ? warn_(...args) : undefined;

class YTSCompiler {
  constructor(options) {
    this.debug = false;
    const keys = Object.keys(options || {});

    for (let key of keys) {
      switch (key) {
        case "debug":
          __yuptoswagger__.debug = true;
          break;

        default:
          console.warn(`${key} is not recognized as a valid option property`);
      }
    }
  }

  parse_tests(type, tests) {
    const map = {
      "string": {
        "min": "minLength",
        "max": "maxLength",
        "email": "format",
        "url": "format",
        "uuid": "format",
        "matches": ["pattern", "regex"] // required: todo

      }
    };
    let properties = {};
    const type_map = map[type];

    for (let test of tests) {
      const {
        name,
        params
      } = test;
      const match = type_map[name];

      if (!match) {
        console.warn(`[WARN] yuptoswagger.js: ignoring ${name}`);
        continue;
      }

      if (isArray(match) && match.length == 2) {
        const [key, value_key] = match;
        const _value = params[value_key];
        const value_str = _value.toString ? _value.toString() : _value;
        properties[key] = value_str;
        continue;
      }

      const value = params[name] || name;
      properties[match] = value;
      console.log({
        [match]: value
      });
    }

    return properties;
  }

  parse_string_schema(type, properties) {
    const {
      oneOf,
      tests
    } = properties;
    const enum_ = oneOf;
    const schema = {
      type,
      enum: enum_
    };
    return schema;
  }

  parse_object_schema(type, properties) {
    const schema = {
      type
    };
    const fields = [];

    for (const field_key of Object.keys(properties.fields)) {
      const field = properties.fields[field_key];
      const parsed = this.compile(field);
      fields.push(parsed);
    }

    return Object.assign({}, schema, {
      fields
    });
  }

  parse_array_schema(type, properties) {
    const schema = {
      type
    };
    const innerType = properties.innerType;
    const items = this.compile(innerType);
    return Object.assign({}, schema, {
      items
    });
  }

  parse_spec_field(spec) {
    const parsed = {};
    const {
      nullable
    } = spec;
    if (nullable) parsed.nullable = nullable;
    return parsed;
  }

  isYupSchema(object) {
    return object.__isYupSchema__ ? object : false;
  }

  compile(schema) {
    let schema_description = schema;
    const yupSchema = this.isYupSchema(schema);
    if (yupSchema) schema_description = yupSchema.describe();
    console.log(schema_description, 'schema_description');

    const {
      type
    } = schema_description,
          properties = _objectWithoutPropertiesLoose(schema_description, _excluded);

    let swagger_schema = {};

    switch (type) {
      case "string":
        swagger_schema = this.parse_string_schema(type, properties);
        break;

      case "object":
        swagger_schema = this.parse_object_schema(type, properties);
        break;

      case "array":
        swagger_schema = this.parse_array_schema(type, properties);
        break;

      default:
        return {
          failed: true
        };
    }

    const from_test_properties = this.parse_tests(type, properties.tests);
    const spec_properties = this.parse_spec_field(properties.spec);
    return mergeObjects({}, swagger_schema, from_test_properties, spec_properties);
  }

}

module.exports = YTSCompiler;
//# sourceMappingURL=index.js.map
