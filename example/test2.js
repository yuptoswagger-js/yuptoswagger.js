// 'use strict'; Object.defineProperty(exports, '__esModule', { value: true }); function hello() { console.log("Working..."); } exports.hello = hello;

/*
https://datatracker.ietf.org/doc/html/draft-wright-json-schema-00#section-1
https://datatracker.ietf.org/doc/html/rfc7159#section-1.1
https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-1
*/

const yup = require("yup");
const YTSCompiler = require("../lib");

const compiler = new YTSCompiler();

let value = compiler.compile(yup.string().min(2));
console.log(value);