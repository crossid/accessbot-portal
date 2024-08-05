const styleguide = require('@vercel/style-guide/prettier')

module.exports = {
    ...styleguide,
    trailingComma: 'none',
    plugins: [...styleguide.plugins, 'prettier-plugin-tailwindcss']
}
