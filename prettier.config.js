/** @type {import('prettier').Config} */
module.exports = {
    singleQuote: true,
    useTabs: false,
    tabWidth: 4,
    plugins: [require('prettier-plugin-tailwindcss')],
    tailwindConfig: './tailwind.config.js',
};
