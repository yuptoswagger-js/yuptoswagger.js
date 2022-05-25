// 'use strict'; Object.defineProperty(exports, '__esModule', { value: true }); function hello() { console.log("Working..."); } exports.hello = hello;

/*
https://datatracker.ietf.org/doc/html/draft-wright-json-schema-00#section-1
https://datatracker.ietf.org/doc/html/rfc7159#section-1.1
https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-1
*/

const yup = require("yup");
const YTSCompiler = require("../lib");

const compiler = new YTSCompiler();

let schema = yup.number().oneOf(["a", "B", 2])

let value = compiler.compile(schema);
console.log(
    value,
    schema.isValidSync(yup.object().shape({ ok: yup.string() })),
    schema.isValidSync("OK"),
    schema.isValidSync(2),
    schema.isValidSync({ not_ok: 1 }),
    schema.isValidSync({ ok: "ok" }),
);  