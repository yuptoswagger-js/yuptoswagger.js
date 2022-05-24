'use strict';

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

  compile(schema) {
    return schema.describe();
  }

}

module.exports = YTSCompiler;
