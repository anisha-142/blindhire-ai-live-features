const ts = require('./typescript.min.js');
const source = `
import React from 'react';
export const Test = () => <div>Hello World</div>;
`;

const res = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit ? ts.JsxEmit.React : 2,
    module: ts.ModuleKind ? ts.ModuleKind.ESNext : 99,
    target: ts.ScriptTarget ? ts.ScriptTarget.ES2020 : 7
  }
});

console.log('--- OUTPUT ---');
console.log(res.outputText);
