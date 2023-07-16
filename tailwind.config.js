/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            gridTemplateColumns: {
                16: 'repeat(16, minmax(0, 1fr))',
            },
        },
    },
    plugins: [],
};
