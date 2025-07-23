module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^react$', '^next/(.*)$', '^@/(.*)$', '^[./]'],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
}
