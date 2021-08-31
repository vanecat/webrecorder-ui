import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'

export default [
  {
    input: 'src/App.vue',
    output: {
      file: 'dist/app.js',
      format: 'es',
      sourcemap: 'inline',
    },
    plugins: [
        vue({css: false}),
        css()
    ],
    external: ['vue'],
  },
]
