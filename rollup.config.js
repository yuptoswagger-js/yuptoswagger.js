import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import filesize from 'rollup-plugin-filesize';

const base = {
  input: './src/index.ts',
  "presets": ["@babel/preset-typescript"],
  plugins: [
    nodeResolve({ extensions: ['.js', '.ts'] }),
    babel({
      babelrc: true,
      envName: 'esm',
      extensions: ['.js', '.ts'],
    }),
  ],
  external: [ 'property-expr' ],
};

module.exports = [
  {
    input: './dts/index.d.ts',
    output: [{ file: 'lib/index.d.ts', format: 'es', sourcemap: true }],
    plugins: [dts()],
  },
  {
    ...base,
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'lib/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'lib/index.umd.js',
        format: 'umd',
        sourcemap: true,
        name: 'yuptoswagger'
      },
    ],
    plugins: [...base.plugins, filesize()],
  },
];
