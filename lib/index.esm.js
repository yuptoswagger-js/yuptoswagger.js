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

const _excluded = ["type"];

class YTSCompiler {
  constructor(options) {
    this.debug = false;
    const keys = Object.keys(options || {});

    for (let key of keys) {
      switch (key) {
        case "debug":
          this.debug = true;
          break;

        default:
          console.warn(`${key} is not recognized as a valid option property`);
      }
    }
  }

  parse_string_schema(type, properties) {
    const {
      oneOf
    } = properties;
    const enum_ = oneOf;
    const schema = {
      type,
      enum: enum_
    };
    console.log(schema);
    return schema;
  }

  compile(schema) {
    const schema_description = schema.describe();

    const {
      type
    } = schema_description,
          properties = _objectWithoutPropertiesLoose(schema_description, _excluded);

    switch (type) {
      case "string":
        return this.parse_string_schema(type, properties);
    }

    return {
      failed: true
    };
  }

}

export { YTSCompiler as default };
