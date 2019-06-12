import node from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'

function getConfig (env) {
  const isProd = env === 'production'
  // {
  //   customResolveOptions: { moduleDirectory: 'node_modules' }
  // }
  const configCreator = (isProd) => {
    const babelArgs = isProd ? { exclude: 'node_modules/**' } : {}
    return Object.assign({
      input: 'src/index.js',
      output: {
        file: `index.${isProd ? '' : 'complete.'}js`,
        format: 'cjs'
      },
      plugins: [
        node(),
        commonjs(),
        babel(babelArgs)
      ],
      external: ['fs', 'path'].concat(isProd ? ['path-to-regexp'] : [])
    }, isProd ? {} : {
      watch: {
        include: 'src/**'
      }
    })
  }
  return isProd ? [configCreator(), configCreator(true)] : configCreator()
}
export default getConfig(process.env.NODE_ENV)