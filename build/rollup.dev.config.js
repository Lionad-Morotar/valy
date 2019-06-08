import getPlugin from './get-plugin'

export default [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    // getPlugin('progress', { clear: false }),
    // getPlugin('eslint'),
    getPlugin('resolve'),
    getPlugin('commonjs'),
    getPlugin('babel'),
    // getPlugin('filesize')
  ].filter(p => p)
}]
